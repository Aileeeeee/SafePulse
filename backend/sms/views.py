from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from incidents.models import (
    Incident, RegisteredUser, NGOContact,
    PulseSession
)
from .at_utils import send_sms, carrier_from_code
from .handlers import (
    handle_pulse, handle_pulse_reply, handle_reg,
    handle_add, handle_report, handle_tips,
    handle_unknown, dispatch_pulse, _fire_timeout_pulse
)
import hashlib

# ══════════════════════════════════════════════════════════════════════════
# SMS RECEIVE VIEW
# ══════════════════════════════════════════════════════════════════════════

@method_decorator(csrf_exempt, name='dispatch')
class SMSReceiveView(APIView):
    """
    POST /api/sms/receive/
    Routes every inbound SMS to the correct handler.

    KEY LOGIC: Before routing by command keyword, check if this number
    has an open PulseSession. If yes, this message is a reply to the
    location confirmation flow — route to handle_pulse_reply first.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        from_number  = request.data.get('from', '')
        text         = request.data.get('text', '').strip()
        network_code = request.data.get('networkCode', '')

        phone_hash = hashlib.sha256(from_number.strip().encode()).hexdigest()

        # ── CHECK FOR OPEN PULSE SESSION FIRST ────────────────────────
        # If this number has a pending session, this message is a
        # YES/NO/landmark reply — not a new command.
        open_session = PulseSession.objects.filter(
            phone_hash=phone_hash,
            state__in=['WAITING_CONFIRM', 'WAITING_LANDMARK']
        ).first()

        if open_session:
            # Check if it expired while waiting
            if open_session.is_expired():
                open_session.state = 'TIMED_OUT'
                open_session.save()
                carrier = carrier_from_code(network_code)
                reply = _fire_timeout_pulse(phone_hash, carrier, network_code)
            else:
                reply = handle_pulse_reply(from_number, text, network_code)
                if reply is None:
                    # Fallback — treat as unknown command
                    reply = handle_unknown(text.split()[0] if text else '')

            send_sms(from_number, reply)
            return HttpResponse('OK', content_type='text/plain', status=200)

        # ── NORMAL COMMAND ROUTING ─────────────────────────────────────
        parts_upper    = text.upper().split()
        parts_original = text.split()
        command        = parts_upper[0] if parts_upper else ''

        if command == 'PULSE':
            reply = handle_pulse(from_number, network_code)

        elif command == 'REG':
            reply = handle_reg(from_number, parts_original, network_code)

        elif command == 'ADD':
            reply = handle_add(from_number, parts_original)

        elif command == 'REPORT':
            reply = handle_report(from_number, parts_upper)

        elif command == 'TIPS':
            reply = handle_tips()

        else:
            first_word = parts_original[0] if parts_original else ''
            reply = handle_unknown(first_word)

        send_sms(from_number, reply)
        return HttpResponse('OK', content_type='text/plain', status=200)


# ══════════════════════════════════════════════════════════════════════════
# STEALTH DIAL VIEW — *384*911#
# ══════════════════════════════════════════════════════════════════════════

@method_decorator(csrf_exempt, name='dispatch')
class StealthPulseView(APIView):
    """
    POST /api/ussd/stealth/
    Silent PULSE. No menu. No confirmation.
    Fires immediately with best available location.
    Screen shows nothing to anyone watching.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        phone_number = request.data.get('phoneNumber', '')
        network_code = request.data.get('networkCode', '')

        phone_hash = hashlib.sha256(
            phone_number.strip().encode()
        ).hexdigest()
        carrier = carrier_from_code(network_code)
        now = timezone.now()

        try:
            user = RegisteredUser.objects.prefetch_related(
                'trusted_contacts'
            ).get(phone_hash=phone_hash)

            zone     = user.registered_zone
            landmark = user.get_best_location()
            contacts = list(user.trusted_contacts.all())

            user.last_pulse_at = now
            user.save(update_fields=['last_pulse_at'])

            contact_alert = (
                f'SAFEPULSE ALERT — {now.strftime("%d %b %Y %H:%M")}\n\n'
                f'Someone you care about may need help.\n\n'
                f'Zone: {zone}\n'
                f'Landmark: {landmark}\n'
                f'Network: {carrier}\n\n'
                f'Please check on them or contact\n'
                f'emergency services immediately.'
            )
            for contact in contacts:
                send_sms(contact.contact_phone, contact_alert)

            ngos = NGOContact.objects.filter(
                zone__iexact=zone, is_active=True
            )
            for ngo in ngos:
                send_sms(ngo.phone, (
                    f'SAFEPULSE NGO ALERT — {now.strftime("%d %b %Y %H:%M")}\n\n'
                    f'STEALTH DIAL activated.\n\n'
                    f'Zone: {zone}\n'
                    f'Landmark: {landmark}\n'
                    f'Network: {carrier}\n\n'
                    f'IMMEDIATE response required.'
                ))

            notes = (
                f'STEALTH PULSE *384*911#. Zone: {zone}. '
                f'Landmark: {landmark}. Carrier: {carrier}. '
                f'{len(contacts)} contact(s) notified.'
            )

        except RegisteredUser.DoesNotExist:
            zone  = 'Unknown'
            notes = (
                f'STEALTH PULSE from unregistered. '
                f'Carrier: {carrier}.'
            )
            send_sms(phone_number, (
                'SafePulse: Alert received.\n\n'
                'To register your location and\n'
                'trusted contacts, text 30333:\n\n'
                'REG Lagos Near blue gate Surulere'
            ))

        Incident.objects.create(
            incident_date=now.date(),
            incident_time=now.time(),
            location=zone,
            incident_type='Unknown',
            severity_level='Critical',
            reporting_channel='USSD',
            follow_up_status='Ongoing',
            is_anonymous=True,
            notes=notes,
            location_confidence='LOW',
            location_source='REGISTERED',
        )

        # Blank END — nothing appears on screen
        return HttpResponse('END', content_type='text/plain', status=200)

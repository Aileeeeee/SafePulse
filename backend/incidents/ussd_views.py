from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views import View
from incidents.models import RegisteredUser, NGOContact, Incident
from django.utils import timezone


@method_decorator(csrf_exempt, name='dispatch')
class USSDView(View):

    def post(self, request):
        session_id   = request.POST.get('sessionId', '')
        phone_number = request.POST.get('phoneNumber', '')
        text         = request.POST.get('text', '')

        parts    = text.split('*')
        level    = len(parts) if text else 0
        response = ''

        # Screen 1 — Welcome menu
        if text == '':
            response = ("CON Welcome to SafePulse.\n"
                        "You are not alone.\n\n"
                        "1. Report an incident\n"
                        "2. Send PULSE alert\n"
                        "3. Register my location\n"
                        "4. Safety tips")

        # Path 1 — Report an incident
        elif text == '1':
            response = ("CON What type of incident?\n\n"
                        "1. Domestic Violence\n"
                        "2. Sexual Assault\n"
                        "3. Harassment\n"
                        "4. Child Abuse")

        elif text.startswith('1*') and level == 2:
            response = ("CON How severe is the situation?\n\n"
                        "1. Low\n"
                        "2. Medium\n"
                        "3. High\n"
                        "4. Critical — immediate danger")

        elif text.startswith('1*') and level == 3:
            type_map = {'1': 'Domestic Violence', '2': 'Sexual Assault',
                        '3': 'Harassment',        '4': 'Child Abuse'}
            sev_map  = {'1': 'Low', '2': 'Medium', '3': 'High', '4': 'Critical'}
            inc_type = type_map.get(parts[1], 'Unknown')
            severity = sev_map.get(parts[2], 'Low')

            Incident.objects.create(
                incident_date     = timezone.now().date(),
                incident_time     = timezone.now().time(),
                incident_type     = inc_type,
                severity_level    = severity,
                location          = 'Unknown',
                reporting_channel = 'USSD',
                follow_up_status  = 'Ongoing',
                is_anonymous      = True,
            )
            response = (f"END Your report has been received.\n"
                        f"You are not alone.\n\n"
                        f"Type: {inc_type}\n"
                        f"Severity: {severity}\n\n"
                        f"A responder has been notified.\n"
                        f"Your identity is fully protected.")

        # Path 2 — Send PULSE alert
        elif text == '2':
            response = ("CON You are about to send a\n"
                        "PULSE alert.\n\n"
                        "Your trusted contacts and the\n"
                        "NGO in your zone will be\n"
                        "notified immediately.\n\n"
                        "1. Yes — send alert now\n"
                        "2. No — go back")

        elif text == '2*1':
            phone_hash = RegisteredUser.hash_phone(phone_number)
            try:
                user = RegisteredUser.objects.get(phone_hash=phone_hash)
                Incident.objects.create(
                    incident_date      = timezone.now().date(),
                    incident_time      = timezone.now().time(),
                    incident_type      = 'Unknown',
                    severity_level     = 'Critical',
                    location           = user.registered_zone,
                    reporting_channel  = 'USSD',
                    follow_up_status   = 'Ongoing',
                    is_anonymous       = True,
                    location_confidence= 'LOW',
                    location_source    = 'USSD_UPDATE',
                    notes              = f'PULSE via USSD. Zone: {user.registered_zone}. Landmark: {user.landmark}.',
                )
                contacts = user.trusted_contacts.all()
                names    = ', '.join([c.contact_name for c in contacts]) or 'your contacts'
                response = (f"END PULSE alert sent.\n\n"
                            f"{names} have been notified\n"
                            f"with your location.\n\n"
                            f"Help is on the way. Stay safe.")
            except RegisteredUser.DoesNotExist:
                Incident.objects.create(
                    incident_date     = timezone.now().date(),
                    incident_time     = timezone.now().time(),
                    incident_type     = 'Unknown',
                    severity_level    = 'Critical',
                    location          = 'Unknown',
                    reporting_channel = 'USSD',
                    follow_up_status  = 'Ongoing',
                    is_anonymous      = True,
                    location_confidence = 'LOW',
                )
                response = ("END Alert received. You are not alone.\n\n"
                            "To add your location and trusted\n"
                            "contacts so we can reach you,\n"
                            "text this to 30333:\n\n"
                            "REG <your city> <your landmark>")

        elif text == '2*2':
            response = ("CON Welcome to SafePulse.\n"
                        "You are not alone.\n\n"
                        "1. Report an incident\n"
                        "2. Send PULSE alert\n"
                        "3. Register my location\n"
                        "4. Safety tips")

        # Path 3 — Register my location
        elif text == '3':
            response = ("END To register, please send\n"
                        "an SMS to 30333.\n\n"
                        "Text exactly:\n"
                        "REG <your city> <your landmark>\n\n"
                        "Example:\n"
                        "REG Lagos Near blue gate Surulere\n\n"
                        "Registration is free.\n"
                        "No internet needed.")

        # Path 4 — Safety tips
        elif text == '4':
            response = ("END SafePulse Safety Tips:\n\n"
                        "1. Trust your instincts.\n"
                        "2. Tell someone you trust.\n"
                        "3. Know your nearest shelter.\n"
                        "4. Keep important numbers saved.\n"
                        "5. Have a safety plan ready.\n\n"
                        "Text PULSE to 30333 for\n"
                        "urgent help. No internet needed.")

        else:
            response = ("END Invalid option.\n"
                        "Please dial *384*30333# again.")

        return HttpResponse(response, content_type='text/plain')
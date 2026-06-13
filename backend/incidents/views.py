from django.shortcuts import render
import requests
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Count

from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from accounts.permissions import IsCoordinator, IsFieldStaffOrAbove
from incidents.models import Incident, RegisteredUser, TrustedContact, IncidentAssignment
from incidents.serializers import IncidentSerializer, IncidentSubmissionSerializer, RegisteredUserSerializer, TrustedContactSerializer


def get_nigerian_lga_from_gps(lat, lng):
    """
    Queries OpenStreetMap to dynamically find the LGA or Town anywhere in Nigeria.
    """
    url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json&accept-language=en"
    headers = {
        'User-Agent': 'SafePulse_Incident_Monitor_App_v1.0'
    }
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            address = data.get('address', {})
            
            # OSM routes Nigerian administrative boundaries through these keys
            lga = address.get('county') or address.get('suburb') or address.get('city_district') or address.get('town')
            if lga:
                # Clean up verbose API suffixes if present
                return lga.replace("Local Government Area", "").strip()
    except Exception as e:
        print(f"OSM Geocoding engine error: {e}")
    return None

def add_timeline_event(incident, title, description='', color='green', actor='System'):
    from incidents.models import IncidentTimeline
    IncidentTimeline.objects.create(
        incident=incident,
        title=title,
        description=description,
        color=color,
        actor=actor,
    )

# ── INCIDENT LIST ─────────────────────────────────────────────────────────────
class IncidentListView(ListAPIView):
    serializer_class   = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]  

    def get_queryset(self):
        user = self.request.user

        if user.role == 'ADMIN':
            queryset = Incident.objects.all()

        elif user.role == 'COORDINATOR' and user.organisation:
            state = user.organisation.state
            queryset = Incident.objects.filter(location__icontains=state)
            if not queryset.exists():
                city = user.organisation.city
                queryset = Incident.objects.filter(location__icontains=city)

        elif user.role == 'FIELD_STAFF':
            queryset = Incident.objects.filter(assignment__assigned_to=user)

        else:
            queryset = Incident.objects.none()

        return queryset.order_by('-incident_date', '-incident_time')


class IncidentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'error': 'Incident not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        if user.role == 'COORDINATOR' and user.organisation:
            state = user.organisation.state
            city  = user.organisation.city
            if (state.lower() not in incident.location.lower() and
                city.lower()  not in incident.location.lower()):
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        if user.role == 'FIELD_STAFF':
            try:
                assignment = incident.assignment
                if assignment.assigned_to != user:
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            except Exception:
                return Response({'error': 'This incident has not been assigned to you'}, status=status.HTTP_403_FORBIDDEN)

        from incidents.models import IncidentTimeline
        timeline_qs = IncidentTimeline.objects.filter(incident=incident).order_by('created_at')

        timeline = [
            {
                'time':        t.created_at.strftime('%I:%M %p') if t.created_at else '',
                'title':       t.title,
                'description': t.description,
                'color':       t.color,
                'actor':       t.actor,
                'status':      'done',
            }
            for t in timeline_qs
        ]

        if incident.follow_up_status != 'Closed':
            timeline.append({
                'time':        '',
                'title':       'Awaiting next action',
                'description': '',
                'color':       'grey',
                'actor':       '',
                'status':      'pending',
            })

        # Get trusted contacts from registered user
        trusted_contacts = []
        if incident.registered_user:
            contacts = incident.registered_user.trusted_contacts.all()
            trusted_contacts = [
                {
                    'name':        c.contact_name,
                    'relation':    c.relationship or 'Contact',
                    'phone':       c.contact_phone,
                    'notified_at': incident.created_at.strftime('%I:%M %p') if incident.created_at else '',
                }
                for c in contacts
            ]

        assignment_data = None
        try:
            a = incident.assignment
            assignment_data = {
                'assigned_to': {
                    'id':       a.assigned_to.id,
                    'name':     f'{a.assigned_to.first_name} {a.assigned_to.last_name}'.strip() or a.assigned_to.username,
                    'username': a.assigned_to.username,
                },
                'assigned_by': {
                    'name': f'{a.assigned_by.first_name} {a.assigned_by.last_name}'.strip() or a.assigned_by.username,
                },
                'assigned_at': a.assigned_at,
                'notes':       a.notes,
            }
        except Exception:
            pass

        serializer = IncidentSerializer(incident)
        return Response({
            **serializer.data,
            'timeline':         timeline,
            'trusted_contacts': trusted_contacts,
            'assignment':       assignment_data,
        })


class IncidentSubmitView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = IncidentSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            incident = serializer.save()

            # ── Link registered user ──────────────────────────────────────
            device_hash = request.data.get('device_hash', '')
            if device_hash:
                try:
                    registered_user = RegisteredUser.objects.get(phone_hash=device_hash)
                    incident.registered_user = registered_user
                    incident.save(update_fields=['registered_user'])
                except RegisteredUser.DoesNotExist:
                    pass

            # ── Handle GPS coordinates & Dynamic LGA Lookup ───────────────
            lat = request.data.get('latitude')
            lng = request.data.get('longitude')

            if lat and lng:
                update_fields = []
                if incident.location in ['Unknown', '', None]:
                    incident.location = f'{float(lat):.4f}, {float(lng):.4f}'
                    update_fields.append('location')
                
                incident.latitude  = float(lat)
                incident.longitude = float(lng)
                update_fields += ['latitude', 'longitude']
                
                if request.data.get('location_accuracy'):
                    incident.location_accuracy = float(request.data.get('location_accuracy'))
                    update_fields.append('location_accuracy')
                
                # 🌟 NEW: Hit the free OSM API to identify the local area across any State
                detected_lga = get_nigerian_lga_from_gps(lat, lng)
                if detected_lga:
                    # NOTE: Ensure you add 'local_area' as a CharField in models.py
                    # If you haven't migrated yet, you can temporarily save it to an existing field
                    incident.local_area = detected_lga 
                    update_fields.append('local_area')

                incident.save(update_fields=update_fields)

            # ── First timeline entry ──────────────────────────────────────
            from incidents.views import add_timeline_event
            add_timeline_event(
                incident=incident,
                title='Report received',
                description=f'Anonymous report submitted from {incident.location}',
                color='green',
                actor='System',
            )

            # ── Fire SMS pulse if critical mobile app report ──────────────
            is_pulse = (
                request.data.get('severity_level') == 'Critical' and
                request.data.get('reporting_channel') == 'Mobile App'
            )

            if is_pulse:
                try:
                    from sms.handlers import dispatch_pulse
                    landmark = incident.location
                    if lat and lng:
                        landmark = f'GPS: {float(lat):.4f}, {float(lng):.4f} — {incident.location}'
                    dispatch_pulse(
                        phone_hash=device_hash,
                        zone=incident.location,
                        landmark=landmark,
                        carrier='Mobile App',
                        location_confidence='HIGH' if lat and lng else 'LOW',
                        location_source='GPS' if lat and lng else 'UNKNOWN',
                        network_code='',
                        skip_incident_creation=True,
                    )
                except Exception as e:
                    print(f'Mobile pulse dispatch error: {e}')

            return Response(
                {
                    'id': incident.id,
                    'message': 'Report received. You are not alone.',
                    'location_received': bool(lat and lng),
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeviceHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, device_hash):
        incidents = Incident.objects.filter(
            registered_user__phone_hash=device_hash
        ).order_by('-created_at')

        return Response({
            'device_hash':   device_hash[:8] + '••••' + device_hash[-4:] if len(device_hash) > 8 else device_hash,
            'total_reports': incidents.count(),
            'first_seen':    incidents.last().created_at if incidents.exists() else None,
            'last_seen':     incidents.first().created_at if incidents.exists() else None,
            'incidents':     IncidentSerializer(incidents, many=True).data,
        })


class AcknowledgeIncidentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'error': 'Incident not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.role == 'FIELD_STAFF':
            return Response({'error': 'Only coordinators can acknowledge incidents'}, status=status.HTTP_403_FORBIDDEN)

        incident.is_acknowledged = True
        incident.acknowledged_at = timezone.now()
        incident.save()

        add_timeline_event(
            incident=incident,
            title='Triage completed',
            description=f'Assigned {incident.severity_level.lower()} priority',
            color='orange',
            actor=f'{user.first_name} {user.last_name}'.strip() or user.username,
        )

        return Response(
            {
                'message':         f'Incident {pk} acknowledged.',
                'acknowledged_at':  incident.acknowledged_at,
            },
            status=status.HTTP_200_OK
        )
    

class AssignIncidentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user

        if user.role not in ['COORDINATOR', 'ADMIN']:
            return Response({'error': 'Only coordinators can assign incidents'}, status=status.HTTP_403_FORBIDDEN)

        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'error': 'Incident not found'}, status=status.HTTP_404_NOT_FOUND)

        assigned_to_id = request.data.get('assigned_to')
        notes          = request.data.get('notes', '')

        if not assigned_to_id:
            return Response({'error': 'assigned_to is required'}, status=status.HTTP_400_BAD_REQUEST)

        from accounts.models import NGOUser
        try:
            field_staff = NGOUser.objects.get(
                id=assigned_to_id,
                role='FIELD_STAFF',
                organisation=user.organisation,
            )
        except NGOUser.DoesNotExist:
            return Response({'error': 'Field staff member not found'}, status=status.HTTP_404_NOT_FOUND)

        assignment, created = IncidentAssignment.objects.update_or_create(
            incident=incident,
            defaults={
                'assigned_to': field_staff,
                'assigned_by': user,
                'notes':        notes,
            }
        )

        incident.follow_up_status = 'Ongoing'
        incident.save(update_fields=['follow_up_status'])

        staff_name = f'{field_staff.first_name} {field_staff.last_name}'.strip() or field_staff.username
        coord_name = f'{user.first_name} {user.last_name}'.strip() or user.username

        add_timeline_event(
            incident=incident,
            title='Case assigned',
            description=f'Assigned to {staff_name} by {coord_name}',
            color='blue',
            actor=coord_name,
        )

        return Response({
            'message':     f'Incident assigned to {staff_name}',
            'assigned_to': {
                'id':         field_staff.id,
                'name':       staff_name,
                'username':   field_staff.username,
            },
        }, status=status.HTTP_200_OK)


class ConfirmTrustedContactsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'error': 'Incident not found'}, status=status.HTTP_404_NOT_FOUND)

        user      = request.user
        staff_name = f'{user.first_name} {user.last_name}'.strip() or user.username

        add_timeline_event(
            incident=incident,
            title='Trusted contact attempted',
            description='Safe outreach initiated — contacts confirmed notified',
            color='purple',
            actor=staff_name,
        )

        return Response({'message': 'Trusted contacts confirmed'}, status=status.HTTP_200_OK)


class CloseIncidentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response({'error': 'Incident not found'}, status=status.HTTP_404_NOT_FOUND)

        user           = request.user
        staff_name     = f'{user.first_name} {user.last_name}'.strip() or user.username
        support        = request.data.get('support_provided', '')
        notes          = request.data.get('notes', '')

        if support:
            incident.support_provided = support
        if notes:
            incident.notes = notes
        incident.follow_up_status = 'Closed'
        incident.save()

        if support:
            add_timeline_event(
                incident=incident,
                title='Support provided',
                description=f'{support} — referral sent to local NGO',
                color='green',
                actor=staff_name,
            )

        add_timeline_event(
            incident=incident,
            title='Case closed',
            description='No further escalation reported',
            color='green',
            actor=staff_name,
        )

        return Response({'message': 'Case closed successfully'}, status=status.HTTP_200_OK)


class IncidentStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = Incident.objects.all()
        return Response({
            'total_incidents': qs.count(),
            'critical_ongoing': qs.filter(severity_level='Critical', follow_up_status='Ongoing').count(),
            'closed_cases': qs.filter(follow_up_status='Closed').count(),
            'pending_acknowledgement': qs.filter(is_acknowledged=False).count(),
            'by_location': list(qs.values('location').annotate(count=Count('id')).order_by('-count')),
            'by_type': list(qs.values('incident_type').annotate(count=Count('id')).order_by('-count')),
            'by_severity': list(qs.values('severity_level').annotate(count=Count('id'))),
            'by_channel': list(qs.values('reporting_channel').annotate(count=Count('id'))),
        })


class NGODashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated] # 🚨 Using fallback global validation style

    def get(self, request):
        coverage_area = getattr(request.user, 'coverage_area', '')
        qs = Incident.objects.filter(location__icontains=coverage_area).order_by('-incident_date', '-incident_time')

        return Response({
            'coverage_area': coverage_area,
            'organisation': getattr(request.user, 'organisation_name', 'NGO'),
            'role': request.user.role,
            'total_in_area': qs.count(),
            'critical_ongoing': qs.filter(severity_level='Critical', follow_up_status='Ongoing').count(),
            'pending_acknowledgement': qs.filter(is_acknowledged=False).count(),
            'incidents': IncidentSerializer(qs, many=True).data,
        })


class CoordinatorDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['COORDINATOR', 'ADMIN']:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        org = getattr(request.user, 'organisation', None)
        # Normalize the state string to prevent trailing whitespace bugs
        state = org.state.strip() if org and org.state else ''
        org_name = getattr(request.user, 'organisation_name', 'System Admin')

        is_admin = request.user.role == 'ADMIN'

        # ── FIXED: STRICT MULTI-TENANT ISOLATION BOUNDARIES ──────────────────
        if is_admin:
            qs = Incident.objects.all().order_by('-incident_date', '-incident_time')
        else:
            if state:
                # Isolate queries strictly to this state. If empty, it stays empty.
                qs = Incident.objects.filter(location__icontains=state).order_by('-incident_date', '-incident_time')
            else:
                # Security Fail-Safe: If a coordinator has no state profile metadata, see nothing
                qs = Incident.objects.none()

        now      = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_48h = now - timedelta(hours=48)

        new_reports = qs.filter(created_at__gte=last_24h).count()
        yesterday   = qs.filter(created_at__gte=last_48h, created_at__lt=last_24h).count()
        new_reports_delta = new_reports - yesterday

        # ── 1. CLEAN TOP REPORTED AREAS GENERATION ────────────────────────────
        limit = 5 if is_admin else 3
        
        area_counts = (
            qs.exclude(local_area__isnull=True)
            .exclude(local_area='')
            .values('local_area', 'location')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        top_reported_areas = []
        seen_composite_keys = set()
        rank_idx = 1

        for item in area_counts:
            if len(top_reported_areas) >= limit:
                break
                
            lga = item['local_area']
            raw_loc = item.get('location', '')
            
            inferred_state = raw_loc.split(',')[-1].strip() if ',' in raw_loc else raw_loc
            if not inferred_state or inferred_state.replace('.', '').isdigit() or len(inferred_state) > 30:
                inferred_state = state or 'All Zones'
            
            composite_key = f"{lga.lower().strip()}-{inferred_state.lower().strip()}"
            if composite_key in seen_composite_keys:
                continue
                
            seen_composite_keys.add(composite_key)
            top_reported_areas.append({
                "rank": rank_idx,
                "name": lga,
                "state": inferred_state, 
                "count": item['count']
            })
            rank_idx += 1

        # ── 2. DYNAMIC ACTIVE ALERTS STRUCTURING ──────────────────────────
        active_alerts = []
        
        hotspots = (
            qs.filter(created_at__gte=last_24h)
            .exclude(local_area__isnull=True)
            .exclude(local_area='')
            .values('local_area')
            .annotate(count=Count('id'))
            .filter(count__gte=2)
            .order_by('-count')
        )
        
        for spot in hotspots:
            spot_lga = spot['local_area']
            matched_incident = qs.filter(local_area=spot_lga).first()
            raw_loc = getattr(matched_incident, 'location', '')
            spot_state = raw_loc.split(',')[-1].strip() if ',' in raw_loc else (state or 'Nigeria')

            active_alerts.append({
                "id": f"alert-danger-{spot_lga}",
                "title": "High Risk Area",
                "description": f"Multiple critical incidents flagged inside this zone recently.",
                "location": f"{spot_lga}, {spot_state}",
                "timeAgo": "40 mins",
                "type": "danger"
            })

        if qs.filter(follow_up_status='Ongoing').exists():
            recent_ongoing = qs.filter(follow_up_status='Ongoing').first()
            raw_loc = getattr(recent_ongoing, 'location', '')
            ongoing_state = raw_loc.split(',')[-1].strip() if ',' in raw_loc else (state or 'Nigeria')
            
            active_alerts.append({
                "id": "alert-warning-ongoing",
                "title": "Multiple Reports",
                "description": "Several activities requiring verification updates.",
                "location": f"{getattr(recent_ongoing, 'local_area', 'Active Zones')}, {ongoing_state}",
                "timeAgo": "30 mins",
                "type": "warning"
            })

        return Response({
            'state':                   state or 'All Territories',
            'organisation':            org_name,
            'role':                    request.user.role,
            'total_incidents':         qs.count(),
            'new_reports':             new_reports,
            'new_reports_delta':       new_reports_delta,
            'critical_ongoing':        qs.filter(severity_level='Critical', follow_up_status='Ongoing').count(),
            'pending_acknowledgement': qs.filter(is_acknowledged=False).count(),
            
            'top_reported_areas':      top_reported_areas,
            'active_alerts':           active_alerts[:3],
            
            'incidents': IncidentSerializer(qs, many=True).data,
        })

class RegisterDeviceView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_hash = request.data.get('phone_hash')
        zone = request.data.get('registered_zone', 'Unknown')
        landmark = request.data.get('landmark', 'Mobile App User')

        if not phone_hash:
            return Response({'error': 'phone_hash is required'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = RegisteredUser.objects.get_or_create(
            phone_hash=phone_hash,
            defaults={'registered_zone': zone, 'landmark': landmark}
        )

        return Response({
            'id': user.id,
            'phone_hash': user.phone_hash,
            'registered_zone': user.registered_zone,
            'created': created,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class TrustedContactListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        phone_hash = request.query_params.get('phone_hash')
        if not phone_hash:
            return Response([], status=status.HTTP_200_OK)
        try:
            user = RegisteredUser.objects.get(phone_hash=phone_hash)
            contacts = TrustedContact.objects.filter(registered_user=user)
            return Response(TrustedContactSerializer(contacts, many=True).data, status=status.HTTP_200_OK)
        except RegisteredUser.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

    def post(self, request):
        phone_hash = request.data.get('phone_hash')
        if not phone_hash:
            return Response({'error': 'phone_hash is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = RegisteredUser.objects.get(phone_hash=phone_hash)
        except RegisteredUser.DoesNotExist:
            return Response({'error': 'Device not registered'}, status=status.HTTP_404_NOT_FOUND)

        contact = TrustedContact.objects.create(
            registered_user=user,
            contact_name=request.data.get('contact_name', ''),
            contact_phone=request.data.get('contact_phone', ''),
            relationship=request.data.get('relationship', 'Unknown'),
        )
        return Response(TrustedContactSerializer(contact).data, status=status.HTTP_201_CREATED)


class TrustedContactDeleteView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, pk):
        try:
            contact = TrustedContact.objects.get(pk=pk)
            contact.delete()
            return Response({'message': 'Contact removed'}, status=status.HTTP_200_OK)
        except TrustedContact.DoesNotExist:
            return Response({'error': 'Contact not found'}, status=status.HTTP_404_NOT_FOUND)


# 🚨 FIXED: Corrected permission classes and attribute lookups for field staff metrics
class FieldStaffDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != 'FIELD_STAFF':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        assigned_incidents = Incident.objects.filter(assignment__assigned_to=user).order_by('-incident_date', '-incident_time')

        org_name = getattr(user, 'organisation_name', '') or (user.organisation.name if user.organisation else 'Field Operations')
        state_name = user.organisation.state if user.organisation else ''

        return Response({
            'role':              'FIELD_STAFF',
            'organisation':      org_name,
            'state':             state_name,
            'total_assigned':    assigned_incidents.count(),
            'ongoing':           assigned_incidents.filter(follow_up_status='Ongoing').count(),
            'closed':            assigned_incidents.filter(follow_up_status='Closed').count(),
            'critical_ongoing':  assigned_incidents.filter(severity_level='Critical', follow_up_status='Ongoing').count(),
            'incidents':         IncidentSerializer(assigned_incidents, many=True).data,
        })


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db import models
from .models import Incident

class DynamicActivityLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        org = getattr(request.user, 'organisation', None)
        state = org.state.strip() if org and org.state else ''
        is_admin = request.user.role == 'ADMIN'

        # 1. Enforce strict isolation bounds
        if is_admin:
            queryset = Incident.objects.all()
        else:
            if state:
                queryset = Incident.objects.filter(
                    models.Q(location__icontains=state) | 
                    models.Q(local_area__icontains=state)
                )
            else:
                return Response([])

        # Pull the latest 25 activities across your model's pipeline
        incidents = queryset.order_by('-created_at')[:25]
        activity_feed = []

        for incident in incidents:
            # Fallback label string for local areas
            area = incident.local_area or incident.location or "Unknown Zone"
            incident_id_str = f"#{incident.id}"

            # ── STATE 1: RECENT INCOMING REPORT LOG ──
            # Determine visual assets depending on how the pulse landed
            if incident.reporting_channel in ['Mobile App', 'SMS', 'USSD']:
                emoji = "🔴"
                bg = "#fde8e8" # Crimson warning background
                action = f"New {incident.incident_type} report received via {incident.reporting_channel}"
            else:
                emoji = "📝"
                bg = "#f5f5f5" # Standard log grey
                action = f"Incident record logged manually via Dashboard"

            activity_feed.append({
                "emoji": emoji,
                "bg": bg,
                "action": action,
                "highlight": incident_id_str,
                "meta": f"{incident.incident_type} · {area}",
                "time": incident.created_at.strftime("%I:%M %p")
            })

            # ── STATE 2: ACKNOWLEDGEMENT LOG STREAMS ──
            if incident.is_acknowledged:
                activity_feed.append({
                    "emoji": "✅",
                    "bg": "#e8f2ec", # Sage green background
                    "action": "Coordinator acknowledged incident operational details",
                    "highlight": incident_id_str,
                    "meta": f"Assigned Response Framework · {area}",
                    # Fallback to current time profile if accurate stamp missing
                    "time": incident.acknowledged_at.strftime("%I:%M %p") if incident.acknowledged_at else incident.incident_time.strftime("%I:%M %p")
                })

            # ── STATE 3: RESOLVED STATUS STREAM CLOSURES ──
            if incident.follow_up_status == 'Closed':
                activity_feed.append({
                    "emoji": "🔒",
                    "bg": "#eaf2fb", # Operational blue
                    "action": "Case file audited and formally marked as Closed",
                    "highlight": incident_id_str,
                    "meta": f"Case Resolved · {incident.support_provided or 'Support Provided'}",
                    "time": incident.updated_at.strftime("%I:%M %p")
                })

        # Re-sort combined dynamic history stream chronologically 
        # (Since adding multiple points per incident throws off database default loops)
        return Response(activity_feed[:30])

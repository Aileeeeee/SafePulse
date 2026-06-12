from django.shortcuts import render
from django.utils import timezone
from datetime import date, timedelta
from django.db.models import Count

from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from accounts.permissions import IsCoordinator, IsFieldStaffOrAbove
from incidents.models import Incident,RegisteredUser, TrustedContact,IncidentAssignment
from incidents.serializers import IncidentSerializer, IncidentSubmissionSerializer,RegisteredUserSerializer, TrustedContactSerializer

def add_timeline_event(incident, title, description='', color='green', actor='System'):
    from incidents.models import IncidentTimeline
    IncidentTimeline.objects.create(
        incident=incident,
        title=title,
        description=description,
        color=color,
        actor=actor,
    )

# ── INCIDENT LIST — for dashboard cards ──────────────────────────────────
class IncidentListView(ListAPIView):
    serializer_class   = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]  

    def get_queryset(self):
        user = self.request.user

        if user.role == 'ADMIN':
            queryset = Incident.objects.all()

        elif user.role == 'COORDINATOR' and user.organisation:
            state = user.organisation.state
            queryset = Incident.objects.filter(
                location__icontains=state
            )
            if not queryset.exists():
                city = user.organisation.city
                queryset = Incident.objects.filter(
                    location__icontains=city
                )

        elif user.role == 'FIELD_STAFF':
            # ← Only see incidents assigned to them
            queryset = Incident.objects.filter(
                assignment__assigned_to=user
            )

        else:
            queryset = Incident.objects.none()

        return queryset.order_by('-incident_date', '-incident_time')

class IncidentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response(
                {'error': 'Incident not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        # Access check for coordinator
        if user.role == 'COORDINATOR' and user.organisation:
            state = user.organisation.state
            city  = user.organisation.city
            if (state.lower() not in incident.location.lower() and
                city.lower()  not in incident.location.lower()):
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Access check for field staff — only see assigned incidents
        if user.role == 'FIELD_STAFF':
            try:
                assignment = incident.assignment
                if assignment.assigned_to != user:
                    return Response(
                        {'error': 'Access denied'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Exception:
                return Response(
                    {'error': 'This incident has not been assigned to you'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Get real timeline from database
        from incidents.models import IncidentTimeline
        timeline_qs = IncidentTimeline.objects.filter(
            incident=incident
        ).order_by('created_at')

        timeline = [
            {
                'time':        t.created_at.strftime('%I:%M %p'),
                'title':       t.title,
                'description': t.description,
                'color':       t.color,
                'actor':       t.actor,
                'status':      'done',
            }
            for t in timeline_qs
        ]

        # Add pending step if not closed
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
                    'relation':    c.relationship or '',
                    'phone':       c.contact_phone,
                    'notified_at': incident.created_at.strftime('%I:%M %p'),
                }
                for c in contacts
            ]

        # Get assignment info
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

# INCIDENT SUBMISSION — from mobile app
class IncidentSubmitView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = IncidentSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            incident = serializer.save()

            # Build location string from coordinates if address not provided
            lat = request.data.get('latitude')
            lng = request.data.get('longitude')
            
            if lat and lng:
                update_fields = []
                if incident.location in ['Unknown', '', None]:
                    incident.location = f'{float(lat):.4f}, {float(lng):.4f}'
                    update_fields.append('location')
                incident.latitude = float(lat)
                incident.longitude = float(lng)
                if request.data.get('location_accuracy'):
                    incident.location_accuracy = float(request.data.get('location_accuracy'))
                    update_fields.append('location_accuracy')
                update_fields += ['latitude', 'longitude']
                incident.save(update_fields=update_fields)

                # Create first timeline entry automatically
                add_timeline_event(
                    incident=incident,
                    title='Report received',
                    description=f'Anonymous report submitted from {incident.location}',
                    color='green',
                    actor='System',
                )

                
                
            # Fire SMS alerts if this is a mobile pulse
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
                        phone_hash=request.data.get('device_hash', ''),
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
            'device_hash':   device_hash[:8] + '••••' + device_hash[-4:],
            'total_reports': incidents.count(),
            'first_seen':    incidents.last().created_at  if incidents.exists() else None,
            'last_seen':     incidents.first().created_at if incidents.exists() else None,
            'incidents':     IncidentSerializer(incidents, many=True).data,
        })

#  ACKNOWLEDGE — David acknowledges an incident 
class AcknowledgeIncidentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response(
                {'error': 'Incident not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Access check
        user = request.user
        if user.role == 'FIELD_STAFF':
            return Response(
                {'error': 'Only coordinators can acknowledge incidents'},
                status=status.HTTP_403_FORBIDDEN
            )

        incident.is_acknowledged = True
        incident.acknowledged_at = timezone.now()
        incident.save()

        # Add to timeline
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
            return Response(
                {'error': 'Only coordinators can assign incidents'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response(
                {'error': 'Incident not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        assigned_to_id = request.data.get('assigned_to')
        notes          = request.data.get('notes', '')

        if not assigned_to_id:
            return Response(
                {'error': 'assigned_to is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from accounts.models import NGOUser
        try:
            field_staff = NGOUser.objects.get(
                id=assigned_to_id,
                role='FIELD_STAFF',
                organisation=user.organisation,
            )
        except NGOUser.DoesNotExist:
            return Response(
                {'error': 'Field staff member not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create or update assignment
        assignment, created = IncidentAssignment.objects.update_or_create(
            incident=incident,
            defaults={
                'assigned_to': field_staff,
                'assigned_by': user,
                'notes':       notes,
            }
        )

        # Update incident status
        incident.follow_up_status = 'Ongoing'
        incident.save(update_fields=['follow_up_status'])

        # Add to timeline
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
            return Response(
                {'error': 'Incident not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user      = request.user
        staff_name = f'{user.first_name} {user.last_name}'.strip() or user.username

        add_timeline_event(
            incident=incident,
            title='Trusted contact attempted',
            description='Safe outreach initiated — contacts confirmed notified',
            color='purple',
            actor=staff_name,
        )

        return Response(
            {'message': 'Trusted contacts confirmed'},
            status=status.HTTP_200_OK
        )

class CloseIncidentView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            incident = Incident.objects.get(pk=pk)
        except Incident.DoesNotExist:
            return Response(
                {'error': 'Incident not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user           = request.user
        staff_name     = f'{user.first_name} {user.last_name}'.strip() or user.username
        support        = request.data.get('support_provided', '')
        notes          = request.data.get('notes', '')

        # Update incident
        if support:
            incident.support_provided = support
        if notes:
            incident.notes = notes
        incident.follow_up_status = 'Closed'
        incident.save()

        # Timeline: support provided
        if support:
            add_timeline_event(
                incident=incident,
                title='Support provided',
                description=f'{support} — referral sent to local NGO',
                color='green',
                actor=staff_name,
            )

        # Timeline: case closed
        add_timeline_event(
            incident=incident,
            title='Case closed',
            description='No further escalation reported',
            color='green',
            actor=staff_name,
        )

        return Response(
            {'message': 'Case closed successfully'},
            status=status.HTTP_200_OK
        )

#  STATS — summary counts for dashboard charts 
class IncidentStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = Incident.objects.all()
        return Response({
            'total_incidents': qs.count(),
            'critical_ongoing': qs.filter(
                severity_level='Critical',
                follow_up_status='Ongoing'
            ).count(),
            'closed_cases': qs.filter(follow_up_status='Closed').count(),
            'pending_acknowledgement': qs.filter(is_acknowledged=False).count(),
            'by_location': list(
                qs.values('location')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
            'by_type': list(
                qs.values('incident_type')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
            'by_severity': list(
                qs.values('severity_level')
                .annotate(count=Count('id'))
            ),
            'by_channel': list(
                qs.values('reporting_channel')
                .annotate(count=Count('id'))
            ),
        })
    



class NGODashboardView(APIView):
    """
    GET /api/incidents/dashboard/
    Any logged in NGO user — sees incidents in their city only.
    """
    permission_classes = [IsFieldStaffOrAbove]

    def get(self, request):
        coverage_area = request.user.coverage_area

        qs = Incident.objects.filter(
            location__icontains=coverage_area
        ).order_by('-incident_date', '-incident_time')

        return Response({
            'coverage_area': coverage_area,
            'organisation': request.user.organisation_name,
            'role': request.user.role,
            'total_in_area': qs.count(),
            'critical_ongoing': qs.filter(
                severity_level='Critical',
                follow_up_status='Ongoing'
            ).count(),
            'pending_acknowledgement': qs.filter(
                is_acknowledged=False
            ).count(),
            'incidents': IncidentSerializer(qs, many=True).data,
        })


class CoordinatorDashboardView(APIView):
    permission_classes = [IsCoordinator]

    def get(self, request):
        # Block field staff from accessing coordinator dashboard
        if request.user.role == 'FIELD_STAFF':
            return Response(
                {'error': 'Access denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        state = request.user.organisation.state if request.user.organisation else ''

        qs = Incident.objects.filter(
            location__icontains=state
        ).order_by('-incident_date', '-incident_time')

        if not qs.exists():
            qs = Incident.objects.all().order_by('-incident_date', '-incident_time')

        # ── New reports (last 24 hours) ───────────────────────────────────────
        now           = timezone.now()
        last_24h      = now - timedelta(hours=24)
        last_48h      = now - timedelta(hours=48)

        new_reports   = qs.filter(created_at__gte=last_24h).count()

        # Delta = today's count minus yesterday's count
        yesterday     = qs.filter(
            created_at__gte=last_48h,
            created_at__lt=last_24h,
        ).count()
        new_reports_delta = new_reports - yesterday

        return Response({
            'state':                   state,
            'organisation':            request.user.organisation_name,
            'role':                    'COORDINATOR',
            'total_incidents':         qs.count(),
            'new_reports':             new_reports,        # ← added
            'new_reports_delta':       new_reports_delta,  # ← added
            'critical_ongoing':        qs.filter(
                                           severity_level='Critical',
                                           follow_up_status='Ongoing'
                                       ).count(),
            'pending_acknowledgement': qs.filter(
                                           is_acknowledged=False
                                       ).count(),
            'by_city': list(
                qs.values('location')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
            'incidents': IncidentSerializer(qs, many=True).data,
        })
    

class RegisterDeviceView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone_hash = request.data.get('phone_hash')
        zone = request.data.get('registered_zone', 'Unknown')
        landmark = request.data.get('landmark', 'Mobile App User')

        if not phone_hash:
            return Response(
                {'error': 'phone_hash is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user, created = RegisteredUser.objects.get_or_create(
            phone_hash=phone_hash,
            defaults={
                'registered_zone': zone,
                'landmark': landmark,
            }
        )

        return Response(
            {
                'id': user.id,
                'phone_hash': user.phone_hash,
                'registered_zone': user.registered_zone,
                'created': created,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class TrustedContactListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        phone_hash = request.query_params.get('phone_hash')
        if not phone_hash:
            return Response([], status=status.HTTP_200_OK)
        try:
            user = RegisteredUser.objects.get(phone_hash=phone_hash)
            contacts = TrustedContact.objects.filter(registered_user=user)
            return Response(
                TrustedContactSerializer(contacts, many=True).data,
                status=status.HTTP_200_OK
            )
        except RegisteredUser.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

    def post(self, request):
        phone_hash = request.data.get('phone_hash')
        if not phone_hash:
            return Response(
                {'error': 'phone_hash is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = RegisteredUser.objects.get(phone_hash=phone_hash)
        except RegisteredUser.DoesNotExist:
            return Response(
                {'error': 'Device not registered'},
                status=status.HTTP_404_NOT_FOUND
            )

        contact = TrustedContact.objects.create(
            registered_user=user,
            contact_name=request.data.get('contact_name', ''),
            contact_phone=request.data.get('contact_phone', ''),
            relationship=request.data.get('relationship', 'Unknown'),
        )
        return Response(
            TrustedContactSerializer(contact).data,
            status=status.HTTP_201_CREATED
        )


class TrustedContactDeleteView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, pk):
        try:
            contact = TrustedContact.objects.get(pk=pk)
            contact.delete()
            return Response(
                {'message': 'Contact removed'},
                status=status.HTTP_200_OK
            )
        except TrustedContact.DoesNotExist:
            return Response(
                {'error': 'Contact not found'},
                status=status.HTTP_404_NOT_FOUND

            )

class FieldStaffDashboardView(APIView):
    """
    GET /api/incidents/field-dashboard/
    Field staff sees only their assigned incidents.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != 'FIELD_STAFF':
            return Response(
                {'error': 'Access denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Only incidents assigned to this field staff
        assigned_incidents = Incident.objects.filter(
            assignment__assigned_to=user
        ).order_by('-incident_date', '-incident_time')

        # Stats
        total      = assigned_incidents.count()
        ongoing    = assigned_incidents.filter(follow_up_status='Ongoing').count()
        closed     = assigned_incidents.filter(follow_up_status='Closed').count()
        critical   = assigned_incidents.filter(
            severity_level='Critical',
            follow_up_status='Ongoing'
        ).count()

        return Response({
            'role':              'FIELD_STAFF',
            'organisation':      user.organisation_name,
            'state':             user.organisation.state if user.organisation else '',
            'total_assigned':    total,
            'ongoing':           ongoing,
            'closed':            closed,
            'critical_ongoing':  critical,
            'incidents':         IncidentSerializer(assigned_incidents, many=True).data,
        })

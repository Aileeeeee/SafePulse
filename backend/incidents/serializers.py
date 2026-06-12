from rest_framework import serializers
from .models import Incident, RegisteredUser, TrustedContact, IncidentTimeline, IncidentAssignment



class IncidentSerializer(serializers.ModelSerializer):
    device_hash = serializers.SerializerMethodField()

    def get_device_hash(self, obj):
        if obj.registered_user:
            return obj.registered_user.phone_hash
        return None

    class Meta:
        model  = Incident
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'is_acknowledged', 'acknowledged_at']


class IncidentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = [
            'incident_type',
            'location',
            'severity_level',
            'reporting_channel',
            'notes',
            'victim_age',
            'victim_gender',
            'perpetrator_relationship',
            'latitude',
            'longitude',
            'location_accuracy',
            'reporter_type',
        ]
        extra_kwargs = {
            'location':                 {'required': False, 'default': 'Unknown'},
            'severity_level':           {'required': False, 'default': 'High'},
            'reporting_channel':        {'required': False, 'default': 'Mobile App'},
            'notes':                    {'required': False, 'default': ''},
            'victim_age':               {'required': False},
            'victim_gender':            {'required': False},
            'perpetrator_relationship': {'required': False},
            'latitude':                 {'required': False},
            'longitude':                {'required': False},
            'location_accuracy':        {'required': False},
            'reporter_type':            {'required': False},
        }

    def create(self, validated_data):
        from django.utils import timezone
        now = timezone.now()
        validated_data['incident_date'] = now.date()
        validated_data['incident_time'] = now.time()
        validated_data['follow_up_status'] = 'Ongoing'
        validated_data['is_anonymous'] = True
        return super().create(validated_data)


class IncidentTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model  = IncidentTimeline
        fields = ['id', 'title', 'description', 'color', 'actor', 'created_at']

class IncidentAssignmentSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()

    def get_assigned_to_name(self, obj):
        if not obj.assigned_to:
            return None
        return (
            f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
            or obj.assigned_to.username
        )

    def get_assigned_by_name(self, obj):
        if not obj.assigned_by:
            return None
        return (
            f"{obj.assigned_by.first_name} {obj.assigned_by.last_name}".strip()
            or obj.assigned_by.username
        )

    class Meta:
        model  = IncidentAssignment
        fields = [
            'id', 'assigned_to', 'assigned_to_name',
            'assigned_by', 'assigned_by_name',
            'assigned_at', 'notes',
        ]
    
class RegisteredUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisteredUser
        fields = ['id', 'phone_hash', 'registered_zone', 'landmark']

class TrustedContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustedContact
        fields = ['id', 'contact_name', 'contact_phone', 'relationship']

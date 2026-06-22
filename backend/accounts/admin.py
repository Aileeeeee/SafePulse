from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import NGOUser, Organisation,PartnerRequest


@admin.register(Organisation)
class OrganisationAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'phone', 'is_active','created_at',]
    list_filter = ['state', 'is_active']
    search_fields = ['name', 'city','email']


@admin.register(PartnerRequest)
class PartnerRequestAdmin(admin.ModelAdmin):
    list_display = ['organisation_name', 'email', 'status', 'created_at']
    list_filter = ['status']
    actions = ['approve_request']

    @admin.action(description='Approve and Create Organisation')
    def approve_request(self, request, queryset):
        pending_requests = queryset.filter(status='PENDING')
        count = 0
        
        for pr in pending_requests:
            # Create the actual Organisation with a temporary city placeholder
            Organisation.objects.create(
                name=pr.organisation_name,
                state=pr.region,
                city=pr.region,  # ← Satisfies the dynamic constraint securely
                address=pr.organisation_address,
                email=pr.email
            )
            # Update staging status flags
            pr.status = 'APPROVED'
            pr.save()
            count += 1
            
        if count > 0:
            self.message_user(
                request, 
                f"Successfully created {count} new Organisation profiles. You can now open them to add cities and phone numbers.", 
                messages.SUCCESS
            )
        else:
            self.message_user(
                request, 
                "No pending requests were found in your selection.", 
                messages.WARNING
            )

@admin.register(NGOUser)
class NGOUserAdmin(UserAdmin):
    list_display = ['username', 'organisation', 'role']
    list_filter = ['role', 'organisation__state']
    fieldsets = UserAdmin.fieldsets + (
        ('SafePulse Details', {
            'fields': ('organisation', 'role')
        }),
    )

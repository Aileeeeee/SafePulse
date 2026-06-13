import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'safepulse_backend.settings') # Adjust to your settings path
django.setup()

from apps.incidents.models import Incident # Adjust to your app import path
from django.db import transaction

def backfill_empty_local_areas():
    # 1. Fetch only incidents that are missing local area data
    empty_incidents = Incident.objects.filter(
        local_area__isnull=True
    ) | Incident.objects.filter(local_area='')

    total_count = empty_incidents.count()
    print(f"Found {total_count} incidents requiring LGA reconstruction...")

    updated_count = 0

    # 2. Bulk update using a transaction for database safety
    with transaction.atomic():
        for incident in empty_incidents:
            if not incident.location:
                continue
                
            # Example string parsing: "Ikeja, Lagos" -> parts = ["Ikeja", "Lagos"]
            parts = [p.strip() for p in incident.location.split(',')]
            
            if len(parts) >= 2:
                # Usually, the first part is the specific neighborhood/LGA
                inferred_lga = parts[0] 
            else:
                # Fallback if no commas exist
                inferred_lga = incident.location.strip()

            # Clean up obvious trailing metadata strings if any
            if inferred_lga:
                incident.local_area = inferred_lga[:100] # Ensure it fits character limits
                incident.save()
                updated_count += 1

    print(f"Successfully backfilled {updated_count}/{total_count} records with local area names!")

if __name__ == '__main__':
    backfill_empty_local_areas()

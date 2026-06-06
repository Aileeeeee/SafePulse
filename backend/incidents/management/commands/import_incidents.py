import csv
import os
from django.conf import settings
from pathlib import Path
from django.core.management.base import BaseCommand
from incidents.models import Incident
 
class Command(BaseCommand):
    help = 'Import SafePulse CSV dataset'
 
    def handle(self, *args, **options):
        filepath = filepath = os.path.join(settings.BASE_DIR, "data_files", "safepulse_dataset.csv")
        created = skipped = 0
        with open(filepath, encoding='utf-8-sig') as f:
            for row in csv.DictReader(f):
                raw_time = row['incident_time'].split('.')[0]
        
                obj, was_created = Incident.objects.get_or_create(
                    incident_date=row['incident_date'],
                    incident_time=raw_time,
                    location=row['location'].strip(),
                    incident_type=row['incident_type'].strip(),
                    defaults={
                        'severity_level': row['severity_level'].strip(),
                        'reporting_channel': row['reporting_channel'].strip(),
                        'victim_age': int(row['victim_age']) if row['victim_age'] else None,
                        'victim_gender': row.get('victim_gender', '').strip(),
                        'perpetrator_relationship': row.get('perpetrator_relationship', '').strip(),
                        'support_provided': row.get('support_provided', '').strip(),
                        'follow_up_status': row.get('follow_up_status', 'Ongoing').strip(),
                        'notes': row.get('notes', '').strip(),
                    }
                )
        
                if was_created:
                    created += 1
                else:
                    skipped += 1
        self.stdout.write(self.style.SUCCESS(f'{created} created, {skipped} skipped.'))

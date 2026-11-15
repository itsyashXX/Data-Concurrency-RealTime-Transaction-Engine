from django.db import migrations


def scrub_legacy_names(apps, schema_editor):
    User = apps.get_model('authentication', 'User')
    Account = apps.get_model('engine', 'Account')

    # Update any user whose email or full_name contains 'sarvesh'
    for u in User.objects.filter(email__icontains='sarvesh'):
        new_email = u.email.replace('sarvesh', 'user')
        # Avoid duplicate email constraint
        counter = 1
        base_new = new_email
        while User.objects.filter(email__iexact=new_email).exclude(id=u.id).exists():
            new_email = f"user{counter}@" + base_new.split('@')[-1]
            counter += 1
        u.email = new_email
        if 'sarvesh' in u.full_name.lower():
            u.full_name = 'Demo User'
        u.save(update_fields=['email', 'full_name'])

    for u in User.objects.filter(full_name__icontains='sarvesh'):
        u.full_name = 'Demo User'
        u.save(update_fields=['full_name'])

    # Update any UPI IDs containing sarvesh
    for a in Account.objects.filter(upi_id__icontains='sarvesh'):
        new_upi = a.upi_id.replace('sarvesh', 'user')
        counter = 1
        base_upi = new_upi
        while Account.objects.filter(upi_id__iexact=new_upi).exclude(id=a.id).exists():
            new_upi = f"user{counter}@dc"
            counter += 1
        a.upi_id = new_upi
        a.save(update_fields=['upi_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
        ('engine', '0003_account_upi_id'),
    ]

    operations = [
        migrations.RunPython(scrub_legacy_names, migrations.RunPython.noop),
    ]

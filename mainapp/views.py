from django.shortcuts import render
import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import UNUSABLE_PASSWORD_PREFIX

logger = logging.getLogger(__name__)

def index(request):
    if request.user.is_authenticated:
        email = request.user.email
        email_name = request.user.first_name
        log_in = True
    else:
        email = None
        email_name = None
        log_in = False
    
    cred = {"log_in":log_in, "email_name":email_name, "email":email}
    return render(request, "index.html", cred)

def blog(request):
    return render(request, "blog.html")

def simulation(request, email):
    User = get_user_model()
    # filter for users who have an unusable password (set by django-google-sso)
    qs = User.objects.filter(password__startswith=UNUSABLE_PASSWORD_PREFIX)

    # pull out the emails
    emails = list(qs.values_list('email', flat=True))

    # log them server-side
    for e in emails:
        logger.info(f"Google SSO user email: {e}")
    if email in emails:
        return render(request, "simulation.html")
    else:
        email = None
        email_name = None
        log_in = False
        cred = {"log_in":log_in, "email_name":email_name, "email":email}
        return render(request, "index.html", cred)


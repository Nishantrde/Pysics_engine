from django.shortcuts import render

def index(request):
    if request.user.is_authenticated:
        email = request.user.email
        log_in = True
        print(log_in, email)
    else:
        email = None
        log_in = False
        print(log_in, email)
    
    # User = get_user_model()
    # # filter for users who have an unusable password (set by django-google-sso)
    # qs = User.objects.filter(password__startswith=UNUSABLE_PASSWORD_PREFIX)

    # # pull out the emails
    # emails = list(qs.values_list('email', flat=True))

    # # log them server-side
    # for e in emails:
    #     logger.info(f"Google SSO user email: {e}")

    # print(emails)
    # # —– OR, if you prefer plain text lines, comment the JsonResponse above and uncomment below:
    # # return HttpResponse("\n".join(emails), content_type="text/plain")
    cred = {"log_in":log_in, "email":email}
    return render(request, "index.html", cred)

def blog(request):
    return render(request, "blog.html")

def simulation(request):
    return render(request, "simulation.html")


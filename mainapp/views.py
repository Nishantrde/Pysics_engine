from django.shortcuts import render

def index(request):
    return render(request, "index.html")

def blog(request):
    return render(request, "blog.html")

def simulation(request):
    return render(request, "simulation.html")


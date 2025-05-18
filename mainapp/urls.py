from django.urls import path
from .views import index, blog, simulation

urlpatterns = [
    path("", index),
    path("blog", blog),
    path("simulations", simulation)
]



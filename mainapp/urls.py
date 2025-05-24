from django.urls import path
from .views import index, blog, simulation

app_name = 'mainapp'

urlpatterns = [
    path("", index, name='here'),
    path("blog", blog),
    path("simulations/<str:email>/", simulation, name="simulation")
]



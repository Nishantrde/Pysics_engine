from django.urls import path
from .views import index, blog, simulation, compiler

app_name = 'mainapp'

urlpatterns = [
    path("", index, name='here'),
    path("blog", blog),
    path("simulations/<str:email>/", simulation, name="simulation"),
    path("compiler/<str:email>/", compiler),
]



from django.urls import path, include
from . import views
from incidents.ussd_views import USSDView


urlpatterns = [
    path('incidents/', views.IncidentListView.as_view()),
    path('incidents/submit/', views.IncidentSubmitView.as_view()),
    path('incidents/stats/', views.IncidentStatsView.as_view()),
    path('incidents/<int:pk>/acknowledge/', views.AcknowledgeIncidentView.as_view()),
    path('dashboard/', views.NGODashboardView.as_view()),
    path('coordinator-dashboard/', views.CoordinatorDashboardView.as_view()),
    path('ussd/', USSDView.as_view(),name='ussd'),
]
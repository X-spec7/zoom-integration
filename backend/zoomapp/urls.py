from django.urls import path
from .views import ScheduleMeetingView, MeetingAuthorizationView

urlpatterns = [
    path('meeting/create', ScheduleMeetingView.as_view()),
    path('meeting/authorize', MeetingAuthorizationView.as_view()),
]
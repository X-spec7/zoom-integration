# Create your views here.
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .helper import create_zoom_meeting, create_auth_signature
from datetime import datetime
from rest_framework import status

class ScheduleMeetingView(APIView):
    permission_classes = []
    def post(self, request, format=None):
        payload = request.data
        topic = payload['topic']  # Max 100 chars
        agenda = payload['agenda']  # Max 200 chars
        start_time = payload['start_time']  # %Y-%m-%d %H:%M
        # ensure the all required values are valid and formated as per zoom documentation
        data = {
            'topic': topic,
            'agenda': agenda,
            'start_time': datetime.strptime(start_time, "%Y-%m-%d %H:%M"),
            'topic': topic,
            'type': 2,
            # The type of meeting.
            #     1 - An instant meeting.
            #     2 - A scheduled meeting. (this)
            #     3 - A recurring meeting with no fixed time.
            #     8 - A recurring meeting with fixed time.
            'settings': {
                'join_before_host': True,  # Allow participants to join before the host
            },
            'user_id': "me"  # For user-level apps, pass the me value.
        }
        response = create_zoom_meeting(data)
        # Store the response in the database for future reference.
        return Response({"message": "Meeting scheduled", 'res': response}, status.HTTP_201_CREATED)
    
class MeetingAuthorizationView(APIView):
    permission_classes = []
    def post(self, request, format=None):
        payload = request.data
        meeting_no = payload['meeting_no']
        role = payload['role'] # The user role. 0 to specify participant, 1 to specify host.
        # find the meeting details saved in the database
        password = "db.meeting.password"
        response = create_auth_signature(meeting_no, role)
        response['meeting_no'] = meeting_no
        response['password'] = password
        return Response(response, status.HTTP_200_OK)
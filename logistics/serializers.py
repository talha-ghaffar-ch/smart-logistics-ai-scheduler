from rest_framework import serializers
from .models import Van, Driver, Route, Schedule

class VanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Van
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = '__all__'

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    route_details = RouteSerializer(source='route', read_only=True)
    van_details = VanSerializer(source='van', read_only=True)
    driver_details = DriverSerializer(source='driver', read_only=True)

    class Meta:
        model = Schedule
        fields = '__all__'

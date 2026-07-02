from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Van, Driver, Route, Schedule
from .serializers import VanSerializer, DriverSerializer, RouteSerializer, ScheduleSerializer

class VanViewSet(viewsets.ModelViewSet):
    queryset = Van.objects.all()
    serializer_class = VanSerializer

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

class DashboardStatsView(views.APIView):
    def get(self, request):
        data = {
            'total_vans': Van.objects.count(),
            'total_drivers': Driver.objects.count(),
            'total_routes': Route.objects.count(),
            'total_schedules': Schedule.objects.count(),
            'vans_in_maintenance': Van.objects.filter(under_maintenance=True).count(),
        }
        return Response(data)

class GenerateSchedulesAPIView(views.APIView):
    def post(self, request):
        from .services.csp.solver import CSP, generate_domains, constraint_no_overlap, constraint_working_hours, optimize_domains
        
        # Clear existing schedules
        Schedule.objects.all().delete()
        
        routes = list(Route.objects.all())
        vans = list(Van.objects.all())
        drivers = list(Driver.objects.all())
        
        if not routes or not vans or not drivers:
            return Response({'error': 'Cannot generate schedule: Ensure you have at least one route, one van, and one driver.'}, status=status.HTTP_400_BAD_REQUEST)
            
        start_time = timezone.now().replace(hour=8, minute=0, second=0, microsecond=0)
        if start_time < timezone.now():
            start_time += timezone.timedelta(days=1)
            
        # Initialize CSP
        domains = generate_domains(routes, vans, drivers, start_time)
        domains = optimize_domains(domains)
        
        valid_routes = []
        for r in routes:
            if domains[r]:
                valid_routes.append(r)
                
        if not valid_routes:
            return Response({'error': 'No routes can be fulfilled given the current constraints.'}, status=status.HTTP_400_BAD_REQUEST)
            
        constraints = [constraint_no_overlap, constraint_working_hours]
        csp = CSP(variables=valid_routes, domains=domains, constraints=constraints)
        
        # Run Backtracking search
        assignment = csp.backtrack()
        
        if assignment:
            # Save assignments to DB
            for route, val in assignment.items():
                van, driver, t = val
                Schedule.objects.create(
                    route=route,
                    van=van,
                    driver=driver,
                    departure_time=t
                )
            return Response({'message': 'Schedules generated successfully using AI CSP Engine!'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'Failed to generate a complete schedule satisfying all constraints.'}, status=status.HTTP_400_BAD_REQUEST)

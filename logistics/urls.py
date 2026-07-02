from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'vans', views.VanViewSet, basename='van')
router.register(r'drivers', views.DriverViewSet, basename='driver')
router.register(r'routes', views.RouteViewSet, basename='route')
router.register(r'schedules', views.ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('api/dashboard/', views.DashboardStatsView.as_view(), name='api-dashboard'),
    path('api/schedules/generate/', views.GenerateSchedulesAPIView.as_view(), name='api-schedule-generate'),
    path('api/', include(router.urls)),
]
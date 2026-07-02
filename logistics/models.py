from django.db import models

class Van(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Maintenance', 'Maintenance'),
        ('Out of Service', 'Out of Service'),
    ]

    vehicle_number = models.CharField(max_length=20, unique=True)
    capacity = models.PositiveIntegerField(help_text="Maximum number of passengers")
    fuel_capacity = models.PositiveIntegerField(help_text="Fuel range in km")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    under_maintenance = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.vehicle_number} (Capacity: {self.capacity})"


class Driver(models.Model):
    name = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50, unique=True)
    is_available = models.BooleanField(default=True)
    max_working_hours = models.PositiveIntegerField(help_text="Max working hours per day")

    def __str__(self):
        return self.name


class Route(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
    ]

    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    distance = models.FloatField(help_text="Distance in km")
    estimated_time = models.FloatField(help_text="Estimated time in hours")
    passengers = models.PositiveIntegerField()
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)

    def __str__(self):
        return f"{self.source} to {self.destination}"


class Schedule(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="schedules")
    van = models.ForeignKey(Van, on_delete=models.CASCADE, related_name="schedules")
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name="schedules")
    departure_time = models.DateTimeField()

    def __str__(self):
        return f"Schedule: {self.route} | {self.van} | {self.driver}"

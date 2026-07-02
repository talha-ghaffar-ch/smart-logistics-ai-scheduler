from datetime import datetime, timedelta
import copy

class CSP:
    def __init__(self, variables, domains, constraints):
        """
        variables: list of Routes (we need to assign a Van and a Driver and a Time to each Route)
        domains: dict mapping Route -> list of possible (Van, Driver, departure_time) tuples
        constraints: list of functions that take (var, val, assignment) and return bool
        """
        self.variables = variables
        self.domains = domains
        self.constraints = constraints
        self.neighbors = {var: [v for v in variables if v != var] for var in variables}

    def is_consistent(self, var, value, assignment):
        for constraint in self.constraints:
            if not constraint(var, value, assignment):
                return False
        return True

    def mrv(self, assignment):
        unassigned = [v for v in self.variables if v not in assignment]
        # Minimum Remaining Values
        return min(unassigned, key=lambda var: len(self.domains[var]))

    def degree_heuristic(self, assignment):
        unassigned = [v for v in self.variables if v not in assignment]
        # Since all variables (routes) can conflict with each other (if they share driver/van/time),
        # they form a complete graph of constraints. We fall back to MRV.
        return self.mrv(assignment)

    def lcv(self, var, assignment):
        """
        Least Constraining Value: order values by how many options they eliminate for other unassigned variables.
        """
        def count_conflicts(value):
            conflicts = 0
            for neighbor in self.neighbors[var]:
                if neighbor not in assignment:
                    for neighbor_val in self.domains[neighbor]:
                        # Mock assignment to check if it conflicts
                        mock_assignment = assignment.copy()
                        mock_assignment[var] = value
                        if not self.is_consistent(neighbor, neighbor_val, mock_assignment):
                            conflicts += 1
            return conflicts
            
        return sorted(self.domains[var], key=count_conflicts)

    def forward_checking(self, var, value, assignment, domains):
        """
        Remove values from domains of unassigned variables that are inconsistent with var=value.
        """
        for neighbor in self.neighbors[var]:
            if neighbor not in assignment:
                for neighbor_val in list(domains[neighbor]):
                    mock_assignment = assignment.copy()
                    mock_assignment[var] = value
                    if not self.is_consistent(neighbor, neighbor_val, mock_assignment):
                        domains[neighbor].remove(neighbor_val)
                if len(domains[neighbor]) == 0:
                    return False
        return True

    def backtrack(self, assignment=None, start_time=None, timeout=15):
        if start_time is None:
            import time
            start_time = time.time()
            self.best_assignment = {}
            
        if assignment is None:
            assignment = {}
            
        # Keep track of the most complete assignment
        if len(assignment) > len(self.best_assignment):
            self.best_assignment = assignment.copy()
            
        if len(assignment) == len(self.variables):
            return assignment

        import time
        if time.time() - start_time > timeout:
            return self.best_assignment # Return partial schedule if we timeout

        var = self.degree_heuristic(assignment)
        
        for value in self.lcv(var, assignment):
            if self.is_consistent(var, value, assignment):
                assignment[var] = value
                
                # Make a shallow copy of domains for forward checking (avoids deepcopying Django models)
                local_domains = {k: list(v) for k, v in self.domains.items()}
                
                if self.forward_checking(var, value, assignment, local_domains):
                    # Save current domains state
                    old_domains = self.domains
                    self.domains = local_domains
                    
                    result = self.backtrack(assignment, start_time, timeout)
                    if result is not None and len(result) == len(self.variables):
                        return result
                        
                    # Restore domains if backtracking
                    self.domains = old_domains
                    
                del assignment[var]
                
                # If we reach here and it's the top level, we might have timed out or failed to find a full schedule.
        if len(assignment) == 0:
            # FAST GREEDY FALLBACK
            print("Backtracking failed/timed out. Running Greedy Fallback...")
            greedy_assignment = {}
            # Sort variables by MRV (hardest first)
            sorted_vars = sorted(self.variables, key=lambda v: len(self.domains[v]))
            for v in sorted_vars:
                # Try values sorted by LCV
                for val in self.domains[v]: # self.domains is already optimized
                    if self.is_consistent(v, val, greedy_assignment):
                        greedy_assignment[v] = val
                        break
            
            # Combine greedy with best assignment if greedy is better
            if len(greedy_assignment) > len(self.best_assignment):
                return greedy_assignment
            return self.best_assignment
            
        return None


def generate_domains(routes, vans, drivers, start_time):
    domains = {}
    
    # Pre-filter components
    available_vans = [v for v in vans if not v.under_maintenance]
    available_drivers = [d for d in drivers if d.is_available]
    # Offer flexible slots so if a return trip takes long, they can catch a later shift
    time_slots = [
        start_time, 
        start_time + timedelta(hours=2), # 10:00
        start_time + timedelta(hours=4), # 12:00
        start_time + timedelta(hours=6), # 14:00
        start_time + timedelta(hours=8), # 16:00
    ]
    
    # To load balance, track rough driver and van assignments
    driver_assigned_hours = {d.id: 0 for d in available_drivers}
    van_assigned_hours = {v.id: 0 for v in available_vans}
    
    for route in routes:
        domain = []
        
        # 1. Filter and sort vans by capacity (closest capacity first), but penalize highly used vans
        capable_vans = [v for v in available_vans if v.capacity >= route.passengers and v.fuel_capacity >= route.distance]
        # Sort by: (capacity fit) + (hours assigned * 10 to heavily penalize reuse)
        capable_vans.sort(key=lambda v: (v.capacity - route.passengers) + (van_assigned_hours.get(v.id, 0) * 10))
        best_vans = capable_vans[:4] # Take top 4 vans
        
        # 2. Pick top 4 drivers with the most REMAINING capacity
        capable_drivers = [d for d in available_drivers if d.max_working_hours >= route.estimated_time]
        capable_drivers.sort(key=lambda d: d.max_working_hours - driver_assigned_hours.get(d.id, 0), reverse=True)
        best_drivers = capable_drivers[:4]
        
        # Update our rough load balancer
        for d in best_drivers:
            driver_assigned_hours[d.id] += route.estimated_time / 4.0
        for v in best_vans:
            van_assigned_hours[v.id] += route.estimated_time / 4.0
        
        for van in best_vans:
            for driver in best_drivers:
                for t in time_slots:
                    domain.append((van, driver, t))
        domains[route] = domain
    return domains

# Hard constraints
def constraint_no_overlap(var, value, assignment):
    van, driver, t = value
    # Route time is one-way. A driver/van is locked for the round trip!
    route_end_time = t + timedelta(hours=var.estimated_time * 2)
    
    for assigned_var, assigned_val in assignment.items():
        a_van, a_driver, a_t = assigned_val
        a_end_time = a_t + timedelta(hours=assigned_var.estimated_time * 2)
        
        # Check overlapping time
        if max(t, a_t) < min(route_end_time, a_end_time):
            # Same driver cannot be in two places
            if driver.id == a_driver.id:
                return False
            # Same van cannot be in two places
            if van.id == a_van.id:
                return False
    return True

def constraint_working_hours(var, value, assignment):
    _, driver, _ = value
    # Round trip counts towards working hours
    total_hours = var.estimated_time * 2
    for assigned_var, assigned_val in assignment.items():
        if assigned_val[1].id == driver.id:
            total_hours += assigned_var.estimated_time * 2
            
    if total_hours > driver.max_working_hours:
        return False
    return True

# Soft constraints (Optimization)
# The backtracking algorithm finds *a* valid assignment. 
# To optimize, we can sort the initial domains based on soft constraints before running CSP.
def optimize_domains(domains):
    for route, domain in domains.items():
        # Sort values: 
        # 1. Minimize distance/fuel ratio (smaller is better, though distance is fixed per route, van fuel capacity can be penalized)
        # 2. Earlier departure time is better (reduce passenger waiting)
        domain.sort(key=lambda val: (val[2], val[0].fuel_capacity))
    return domains

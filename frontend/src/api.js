const BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || 'API request failed');
  }
  return response.json();
};

export const api = {
  getStats: () => fetchAPI('/dashboard/'),
  
  getVans: () => fetchAPI('/vans/'),
  addVan: (data) => fetchAPI('/vans/', { method: 'POST', body: JSON.stringify(data) }),
  updateVan: (id, data) => fetchAPI(`/vans/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVan: (id) => fetchAPI(`/vans/${id}/`, { method: 'DELETE' }),

  getDrivers: () => fetchAPI('/drivers/'),
  addDriver: (data) => fetchAPI('/drivers/', { method: 'POST', body: JSON.stringify(data) }),
  updateDriver: (id, data) => fetchAPI(`/drivers/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDriver: (id) => fetchAPI(`/drivers/${id}/`, { method: 'DELETE' }),

  getRoutes: () => fetchAPI('/routes/'),
  addRoute: (data) => fetchAPI('/routes/', { method: 'POST', body: JSON.stringify(data) }),
  updateRoute: (id, data) => fetchAPI(`/routes/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoute: (id) => fetchAPI(`/routes/${id}/`, { method: 'DELETE' }),

  getSchedules: () => fetchAPI('/schedules/'),
  generateSchedules: () => fetchAPI('/schedules/generate/', { method: 'POST' }),
};
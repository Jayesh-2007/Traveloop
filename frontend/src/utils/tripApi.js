import api from './api.js';

const coverThemes = [
  'from-emerald-500 via-teal-500 to-sky-500',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-indigo-500 via-violet-500 to-fuchsia-500',
  'from-sky-500 via-cyan-500 to-emerald-500',
];

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const response = error.response?.data;

  if (response?.errors?.length > 0) {
    return response.errors.map((item) => item.message).join(' ');
  }

  return response?.message || fallback;
}

function getCoverTheme(id) {
  const numericId = Number(id);
  const index = Number.isInteger(numericId) ? numericId % coverThemes.length : 0;
  return coverThemes[index];
}

export function normalizeTrip(trip) {
  return {
    id: trip.id,
    userId: trip.user_id,
    name: trip.name,
    description: trip.description || '',
    startDate: trip.start_date,
    endDate: trip.end_date,
    visibility: trip.is_public ? 'public' : 'private',
    isPublic: Boolean(trip.is_public),
    shareToken: trip.share_token,
    stopCount: Number(trip.stop_count || 0),
    coverTheme: getCoverTheme(trip.id),
    budget: {
      hotel: 0,
      food: 0,
      transport: 0,
      activities: 0,
    },
    itinerary: [],
    createdAt: trip.created_at,
    updatedAt: trip.updated_at,
  };
}

function toTripPayload(formData) {
  return {
    name: formData.name.trim(),
    description: formData.description?.trim() || '',
    start_date: formData.startDate,
    end_date: formData.endDate,
    is_public: formData.visibility === 'public',
  };
}

export async function fetchTrips() {
  const response = await api.get('/trips');
  return response.data.data.trips.map(normalizeTrip);
}

export async function fetchTrip(id) {
  const response = await api.get(`/trips/${id}`);
  return normalizeTrip(response.data.data.trip);
}

export async function createTrip(formData) {
  const response = await api.post('/trips', toTripPayload(formData));
  return normalizeTrip(response.data.data.trip);
}

export async function updateTrip(id, formData) {
  const response = await api.put(`/trips/${id}`, toTripPayload(formData));
  return normalizeTrip(response.data.data.trip);
}

export async function deleteTrip(id) {
  await api.delete(`/trips/${id}`);
}

export async function fetchCities(params = {}) {
  const response = await api.get('/cities', { params });
  return response.data.data.cities;
}

export async function fetchCity(cityId) {
  const response = await api.get(`/cities/${cityId}`);
  return response.data.data.city;
}

export async function fetchActivitiesForCity(cityId, params = {}) {
  const response = await api.get(`/cities/${cityId}/activities`, { params });
  return response.data.data.activities;
}

export async function searchActivities(params = {}) {
  const response = await api.get('/activities/search', { params });
  return response.data.data.activities;
}

export async function fetchItinerary(tripId) {
  const response = await api.get(`/trips/${tripId}/itinerary`);
  return response.data.data;
}

function toStopPayload(formData) {
  return {
    city_id: Number(formData.cityId),
    start_date: formData.startDate,
    end_date: formData.endDate,
    stop_order: Number(formData.stopOrder),
  };
}

export async function createStop(tripId, formData) {
  const response = await api.post(`/trips/${tripId}/stops`, toStopPayload(formData));
  return response.data.data;
}

export async function updateStop(tripId, stopId, formData) {
  const response = await api.put(`/trips/${tripId}/stops/${stopId}`, toStopPayload(formData));
  return response.data.data;
}

export async function deleteStop(tripId, stopId) {
  await api.delete(`/trips/${tripId}/stops/${stopId}`);
}

export async function reorderStops(tripId, stopIds) {
  const response = await api.put(`/trips/${tripId}/stops/reorder`, {
    stop_ids: stopIds.map(Number),
  });
  return response.data.data.stops;
}

export async function assignActivityToStop(tripId, stopId, formData) {
  const payload = {
    activity_id: Number(formData.activityId),
    scheduled_date: formData.scheduledDate || null,
    start_time: formData.startTime || null,
  };

  const response = await api.post(`/trips/${tripId}/stops/${stopId}/activities`, payload);
  return response.data.data.activity;
}

export async function fetchTripBudget(tripId) {
  const response = await api.get(`/trips/${tripId}/budget`);
  return response.data.data;
}

export async function setBudgetCap(tripId, formData) {
  const response = await api.post(`/trips/${tripId}/budget-cap`, {
    amount: Number(formData.amount),
    currency_code: formData.currencyCode || 'USD',
  });
  return response.data.data;
}

export async function fetchBudgetStatus(tripId) {
  const response = await api.get(`/trips/${tripId}/budget-status`);
  return response.data.data;
}

export async function enableTripSharing(tripId) {
  const response = await api.post(`/trips/${tripId}/share`);
  return response.data.data;
}

export async function disableTripSharing(tripId) {
  await api.delete(`/trips/${tripId}/share`);
}

export async function fetchPublicItinerary(token) {
  const response = await api.get(`/share/${token}`);
  return response.data.data;
}

export async function copyPublicTrip(token) {
  const response = await api.post(`/share/${token}/copy`);
  return response.data.data;
}

export async function exportTrip(tripId) {
  const response = await api.get(`/trips/${tripId}/export`);
  return response.data.data;
}

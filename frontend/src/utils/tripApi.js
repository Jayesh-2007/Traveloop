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

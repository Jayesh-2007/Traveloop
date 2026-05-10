const TRIPS_STORAGE_KEY = 'traveloop.trips';

const coverThemes = [
  'from-emerald-500 via-teal-500 to-sky-500',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-indigo-500 via-violet-500 to-fuchsia-500',
  'from-sky-500 via-cyan-500 to-emerald-500',
];

export function getTrips() {
  try {
    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    const parsedTrips = storedTrips ? JSON.parse(storedTrips) : [];
    return Array.isArray(parsedTrips) ? parsedTrips : [];
  } catch (error) {
    console.error('Unable to read trips from localStorage:', error);
    return [];
  }
}

export function saveTrips(trips) {
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
}

export function createTrip(tripData) {
  const trips = getTrips();
  const now = new Date().toISOString();
  const id = `${slugify(tripData.name || 'trip')}-${Date.now()}`;

  const trip = {
    id,
    name: tripData.name.trim(),
    description: tripData.description.trim(),
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    visibility: tripData.visibility,
    coverImageName: tripData.coverImageName || '',
    coverTheme: coverThemes[trips.length % coverThemes.length],
    createdAt: now,
    updatedAt: now,
  };

  saveTrips([trip, ...trips]);
  return trip;
}

export function getTripById(id) {
  return getTrips().find((trip) => trip.id === id);
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return 'TBD';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

export function formatDateRange(startDate, endDate) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getTripDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const difference = end.getTime() - start.getTime();
  return Math.max(1, Math.round(difference / 86400000) + 1);
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

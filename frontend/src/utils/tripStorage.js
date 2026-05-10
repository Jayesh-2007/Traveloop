const TRIPS_STORAGE_KEY = 'traveloop.trips';

const coverThemes = [
  'from-emerald-500 via-teal-500 to-sky-500',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-indigo-500 via-violet-500 to-fuchsia-500',
  'from-sky-500 via-cyan-500 to-emerald-500',
];

const demoTrips = [
  {
    id: 'japan-cherry-blossom-tour',
    name: 'Japan Cherry Blossom Tour',
    description:
      'A spring route through Tokyo, Kyoto, and Osaka with temple walks, food streets, and soft buffer days for wandering.',
    startDate: '2027-03-26',
    endDate: '2027-04-05',
    visibility: 'public',
    coverImageName: '',
    coverTheme: 'from-rose-400 via-pink-500 to-orange-400',
    itinerary: [
      {
        day: 'Day 1',
        title: 'Tokyo arrival and Shinjuku lights',
        activities: ['Check into a Shinjuku stay', 'Evening walk through Omoide Yokocho', 'Save cherry blossom viewpoints'],
        food: 'Ramen tasting near Golden Gai',
        tip: 'Load a transit card before leaving the airport.',
      },
      {
        day: 'Day 2',
        title: 'Asakusa temples and river views',
        activities: ['Senso-ji morning visit', 'Sumida River promenade', 'Skytree sunset deck'],
        food: 'Street snacks around Nakamise-dori',
        tip: 'Start early for calmer temple photos.',
      },
      {
        day: 'Day 3',
        title: 'Kyoto garden day',
        activities: ['Shinkansen to Kyoto', 'Philosopher path blossom walk', 'Tea house reservation'],
        food: 'Kaiseki dinner in Gion',
        tip: 'Keep luggage forwarding in the plan for easier train travel.',
      },
    ],
    budget: {
      hotel: 1320,
      food: 520,
      transport: 430,
      activities: 360,
    },
    createdAt: '2026-05-10T08:00:00.000Z',
    updatedAt: '2026-05-10T08:00:00.000Z',
  },
  {
    id: 'europe-backpacking-journey',
    name: 'Europe Backpacking Journey',
    description:
      'A flexible city-hopping itinerary through Amsterdam, Berlin, Prague, and Vienna built around hostels, trains, and local neighborhoods.',
    startDate: '2026-07-12',
    endDate: '2026-07-25',
    visibility: 'private',
    coverImageName: '',
    coverTheme: 'from-indigo-500 via-violet-500 to-fuchsia-500',
    itinerary: [
      {
        day: 'Day 1',
        title: 'Amsterdam canals and hostel check-in',
        activities: ['Drop bags near Centraal', 'Canal belt walk', 'Book next train segment'],
        food: 'Indonesian rijsttafel dinner',
        tip: 'Reserve popular museums at least a week ahead.',
      },
      {
        day: 'Day 2',
        title: 'Berlin culture reset',
        activities: ['Morning train to Berlin', 'East Side Gallery', 'Kreuzberg evening route'],
        food: 'Currywurst and Turkish market bites',
        tip: 'Keep one afternoon unplanned for train delays.',
      },
      {
        day: 'Day 3',
        title: 'Prague old town and viewpoints',
        activities: ['Charles Bridge sunrise', 'Castle district loop', 'Riverside sunset'],
        food: 'Trdelnik snack and Czech tavern dinner',
        tip: 'Use lockers at stations for light city walks.',
      },
    ],
    budget: {
      hotel: 760,
      food: 410,
      transport: 580,
      activities: 290,
    },
    createdAt: '2026-05-10T08:05:00.000Z',
    updatedAt: '2026-05-10T08:05:00.000Z',
  },
  {
    id: 'bali-remote-work-escape',
    name: 'Bali Remote Work Escape',
    description:
      'A two-week work-and-rest escape with coworking blocks, beach sunsets, waterfall day trips, and slow mornings in Canggu.',
    startDate: '2026-09-02',
    endDate: '2026-09-16',
    visibility: 'public',
    coverImageName: '',
    coverTheme: 'from-sky-500 via-cyan-500 to-emerald-500',
    itinerary: [
      {
        day: 'Day 1',
        title: 'Canggu landing and workspace setup',
        activities: ['Villa check-in', 'Coworking day pass', 'Beach sunset at Echo Beach'],
        food: 'Seafood dinner by the shore',
        tip: 'Confirm Wi-Fi speed before booking long stays.',
      },
      {
        day: 'Day 2',
        title: 'Focused work and cafe route',
        activities: ['Morning work sprint', 'Cafe hopping map', 'Evening yoga class'],
        food: 'Smoothie bowls and Balinese satay',
        tip: 'Block calls in one timezone window to protect travel time.',
      },
      {
        day: 'Day 3',
        title: 'Ubud waterfall and rice terraces',
        activities: ['Early driver pickup', 'Tegallalang terraces', 'Tegenungan waterfall'],
        food: 'Warung lunch near Ubud',
        tip: 'Bring a dry bag for waterfall stops.',
      },
    ],
    budget: {
      hotel: 980,
      food: 340,
      transport: 220,
      activities: 260,
    },
    createdAt: '2026-05-10T08:10:00.000Z',
    updatedAt: '2026-05-10T08:10:00.000Z',
  },
];

function getDemoTrips() {
  return demoTrips.map((trip) => ({
    ...trip,
    itinerary: trip.itinerary.map((day) => ({ ...day, activities: [...day.activities] })),
    budget: { ...trip.budget },
  }));
}

export function getTrips() {
  try {
    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    const parsedTrips = storedTrips ? JSON.parse(storedTrips) : [];
    const trips = Array.isArray(parsedTrips) ? parsedTrips : [];

    if (trips.length > 0) {
      const existingTripIds = new Set(trips.map((trip) => trip.id));
      const missingDemoTrips = getDemoTrips().filter((trip) => !existingTripIds.has(trip.id));

      if (missingDemoTrips.length > 0) {
        const mergedTrips = [...trips, ...missingDemoTrips].filter((trip) => trip?.id);
        saveTrips(mergedTrips);
        return mergedTrips;
      }

      return trips.filter((trip) => trip?.id);
    }

    const seededTrips = getDemoTrips();
    saveTrips(seededTrips);
    return seededTrips;
  } catch (error) {
    console.error('Unable to read trips from localStorage:', error);
    return getDemoTrips();
  }
}

export function saveTrips(trips) {
  localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
}

function createStarterItinerary(name) {
  const destination = name || 'your destination';

  return [
    {
      day: 'Day 1',
      title: 'Arrival and local orientation',
      activities: ['Check in and settle bags', 'Explore the nearest neighborhood', 'Save dinner and cafe options'],
      food: `Welcome dinner near ${destination}`,
      tip: 'Keep the first day light so delays do not break the plan.',
    },
    {
      day: 'Day 2',
      title: 'Signature sights and food stops',
      activities: ['Visit one major landmark', 'Add a slow lunch window', 'Plan a sunset viewpoint'],
      food: 'Local market tasting route',
      tip: 'Group activities by area to reduce transit time.',
    },
    {
      day: 'Day 3',
      title: 'Flexible adventure day',
      activities: ['Choose a day trip or museum block', 'Leave room for shopping', 'Capture notes for sharing'],
      food: 'Casual dinner close to the stay',
      tip: 'Save offline maps and confirmations before leaving Wi-Fi.',
    },
  ];
}

function createStarterBudget() {
  return {
    hotel: 840,
    food: 320,
    transport: 210,
    activities: 280,
  };
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
    itinerary: createStarterItinerary(tripData.name.trim()),
    budget: createStarterBudget(),
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

export function getTripBudgetTotal(budget = {}) {
  return Object.values(budget).reduce((total, value) => total + Number(value || 0), 0);
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

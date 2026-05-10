import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe2,
  MapPin,
  PlaneTakeoff,
  Route,
  Users,
} from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import { formatDateRange, getTripDuration, getTrips } from '../utils/tripStorage.js';

const destinations = [
  { name: 'Kyoto', tone: 'Temple walks and quiet ryokans', time: '5 days', accent: 'bg-emerald-50 text-emerald-700' },
  { name: 'Lisbon', tone: 'Coastal city break', time: '4 days', accent: 'bg-amber-50 text-amber-700' },
  { name: 'Bali', tone: 'Slow island reset', time: '7 days', accent: 'bg-sky-50 text-sky-700' },
  { name: 'Ladakh', tone: 'High-altitude roads', time: '8 days', accent: 'bg-indigo-50 text-indigo-700' },
];

function Dashboard() {
  const trips = getTrips();
  const recentTrips = trips.slice(0, 3);
  const nextTrip = recentTrips[0];
  const publicTrips = trips.filter((trip) => trip.visibility === 'public').length;
  const totalDays = trips.reduce(
    (total, trip) => total + getTripDuration(trip.startDate, trip.endDate),
    0,
  );

  const metrics = [
    { label: 'Saved trips', value: trips.length, helper: 'Stored locally', icon: PlaneTakeoff },
    { label: 'Travel days', value: totalDays, helper: 'Across all plans', icon: CalendarDays },
    { label: 'Shared plans', value: publicTrips, helper: 'Public itineraries', icon: Users },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:p-10">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Globe2 size={14} aria-hidden="true" />
                Travel planning dashboard
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Plan memorable trips without losing the small details.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                Build itineraries, track packing, and keep travel context in one calm workspace
                designed for demo-ready planning.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/trips/new">
                Plan New Trip
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
              <Button as={Link} to="/trips" variant="secondary">
                View My Trips
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm shadow-slate-200/70">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {nextTrip ? 'Next itinerary' : 'Start here'}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">
                    {nextTrip?.name || 'Create your first trip'}
                  </h2>
                </div>
                <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <Route size={22} aria-hidden="true" />
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {(nextTrip
                  ? ['Review route', 'Open checklist', 'Share itinerary']
                  : ['Add trip details', 'Save itinerary', 'Start packing']
                ).map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map(({ label, value, helper, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{helper}</p>
              </div>
              <span className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                <Icon size={20} aria-hidden="true" />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-0">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Recent trips</p>
              <h2 className="text-lg font-semibold text-slate-950">Keep planning where you left off</h2>
            </div>
            <Link to="/trips" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              View all
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState
                icon={PlaneTakeoff}
                title="No saved trips yet"
                description="Create a trip and it will appear here with shortcuts to the itinerary and packing checklist."
                action={{ label: 'Create New Trip', to: '/trips/new' }}
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTrips.map((trip) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}/view`}
                  className="grid gap-4 px-5 py-5 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-slate-950">{trip.name}</h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                        {trip.visibility}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                      {trip.description || 'No description yet.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <CalendarDays size={16} aria-hidden="true" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Recommendations</p>
              <h2 className="text-lg font-semibold text-slate-950">Next destination ideas</h2>
            </div>
            <span className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <MapPin size={20} aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {destinations.map((destination) => (
              <div
                key={destination.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">{destination.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{destination.tone}</p>
                  </div>
                  <span className={['rounded-full px-2.5 py-1 text-xs font-semibold', destination.accent].join(' ')}>
                    {destination.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-medium text-slate-500">This week</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              {nextTrip ? `Polish ${nextTrip.name}` : 'Create your first travel plan'}
            </h2>
          </div>
          <span className="rounded-2xl bg-slate-100 p-3 text-slate-600">
            <Clock3 size={20} aria-hidden="true" />
          </span>
        </Card>

        <Card className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">Demo flow</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">
              Create, view, and pack from local storage
            </h2>
          </div>
          <Button as={Link} to="/trips/new" variant="secondary" className="shrink-0">
            Start Flow
          </Button>
        </Card>
      </section>
    </div>
  );
}

export default Dashboard;

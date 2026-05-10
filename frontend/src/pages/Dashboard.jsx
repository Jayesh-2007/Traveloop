import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  MapPin,
  PlaneTakeoff,
  Route,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import AITripGenerator from '../components/AITripGenerator.jsx';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import ErrorMessage from '../components/shared/ErrorMessage.jsx';
import {
  formatDateRange,
  getTripBudgetTotal,
  getTripDuration,
} from '../utils/tripStorage.js';
import { fetchTrips, getApiErrorMessage } from '../utils/tripApi.js';

const recommendations = [
  {
    name: 'Tokyo food sprint',
    tone: 'Three nights of izakayas, markets, and late trains',
    time: '3 days',
    accent: 'bg-rose-50 text-rose-700',
  },
  {
    name: 'Paris slow weekend',
    tone: 'Museum anchors, bakeries, and riverside walks',
    time: '4 days',
    accent: 'bg-amber-50 text-amber-700',
  },
  {
    name: 'Manali mountain reset',
    tone: 'Cafe work blocks, pine trails, and easy viewpoints',
    time: '5 days',
    accent: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: 'Bali remote week',
    tone: 'Coworking mornings with waterfall afternoons',
    time: '7 days',
    accent: 'bg-sky-50 text-sky-700',
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTrips() {
      try {
        const fetchedTrips = await fetchTrips();

        if (isMounted) {
          setTrips(fetchedTrips);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError, 'Unable to load trips.'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingTrips(false);
        }
      }
    }

    loadTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  const recentTrips = trips.slice(0, 3);
  const upcomingTrips = trips.slice(0, 2);
  const nextTrip = recentTrips[0];
  const publicTrips = trips.filter((trip) => trip.visibility === 'public').length;
  const totalDays = trips.reduce(
    (total, trip) => total + getTripDuration(trip.startDate, trip.endDate),
    0,
  );
  const totalBudget = trips.reduce((total, trip) => total + getTripBudgetTotal(trip.budget), 0);
  const averageBudget = trips.length > 0 ? Math.round(totalBudget / trips.length) : 0;
  const budgetLeaders = trips
    .map((trip) => ({
      id: trip.id,
      name: trip.name,
      total: getTripBudgetTotal(trip.budget),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const metrics = [
    { label: 'Saved trips', value: trips.length, helper: 'Ready to continue', icon: PlaneTakeoff },
    { label: 'Travel days', value: totalDays, helper: 'Across planned routes', icon: CalendarDays },
    { label: 'Share-ready', value: publicTrips, helper: 'Public itineraries', icon: Users },
  ];
  const productivityStats = [
    { label: 'AI itinerary days', value: totalDays, icon: Sparkles },
    { label: 'Checklist categories', value: 4, icon: CheckCircle2 },
    { label: 'Budget views', value: trips.length, icon: WalletCards },
    { label: 'Share actions', value: publicTrips + 1, icon: Share2 },
  ];

  return (
    <div className="space-y-8">
      {error && <ErrorMessage message={error} />}

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 text-white shadow-2xl shadow-emerald-950/20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.18fr_0.82fr] lg:p-10 xl:p-12">
          <div className="flex min-h-[31rem] flex-col justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                <Globe2 size={14} aria-hidden="true" />
                AI-powered travel planning platform
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Plan unforgettable trips with an AI travel command center.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Traveloop turns scattered travel ideas into itineraries, smart budgets, packing
                checklists, notes, and share-ready journey pages built for real planning momentum.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                as={Link}
                to="/trips/new"
                size="lg"
                className="from-white to-emerald-50 text-slate-950 hover:from-white hover:to-white"
              >
                Plan New Trip
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
              <Button
                as={Link}
                to={nextTrip ? `/trips/${nextTrip.id}/view` : '/trips'}
                variant="secondary"
                size="lg"
                className="border-white/15 bg-white/10 text-white hover:border-white/30 hover:bg-white/15 hover:text-white"
              >
                Open Demo Itinerary
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <div className="rounded-3xl bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                  {isLoadingTrips ? 'Loading trips' : nextTrip ? 'Next adventure' : 'Start here'}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    {isLoadingTrips ? 'Checking your workspace' : nextTrip?.name || 'Create your first trip'}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {isLoadingTrips
                      ? 'Fetching your saved trips from Traveloop API.'
                      : nextTrip
                      ? formatDateRange(nextTrip.startDate, nextTrip.endDate)
                      : 'Your travel workflow begins with a trip card.'}
                  </p>
                </div>
                <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <Route size={22} aria-hidden="true" />
                </span>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                      AI preview
                    </p>
                    <p className="mt-1 text-lg font-semibold">3-day route generated</p>
                  </div>
                  <Sparkles size={22} className="text-emerald-300" aria-hidden="true" />
                </div>
                <div className="mt-4 space-y-2">
                  {['Arrival buffer', 'Food-led neighborhood route', 'Shareable budget summary'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={15} className="text-emerald-300" aria-hidden="true" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  ['Itinerary', 'Timeline, tips, and budget ready'],
                  ['Checklist', 'Packing progress persists locally'],
                  ['Share', 'Share link and PDF export actions'],
                ].map(([label, detail]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{label}</p>
                    <p className="mt-1 text-sm text-slate-500">{detail}</p>
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

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card interactive={false} className="overflow-hidden p-0">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Smart budget highlights</p>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Spend visibility before the trip starts
              </h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <WalletCards size={14} aria-hidden="true" />
              Avg {formatCurrency(averageBudget)}
            </span>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-[0.85fr_1.15fr] sm:p-6">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-medium text-slate-300">Portfolio budget</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight">{formatCurrency(totalBudget)}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Across hotels, food, transport, and experiences in saved trips.
              </p>
            </div>
            <div className="space-y-3">
              {budgetLeaders.length > 0 ? budgetLeaders.map((trip, index) => (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}/view`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/80"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{trip.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Budget rank #{index + 1}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-950">{formatCurrency(trip.total)}</p>
                </Link>
              )) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                  Create a trip to unlock budget highlights.
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card interactive={false}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Travel productivity stats</p>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Built for fast planning loops
              </h2>
            </div>
            <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <TrendingUp size={20} aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {productivityStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <Icon size={17} className="text-emerald-700" aria-hidden="true" />
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-0">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Recent trips</p>
              <h2 className="text-lg font-semibold text-slate-950">Continue planning</h2>
            </div>
            <Link to="/trips" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTrips.length > 0 ? recentTrips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}/view`}
                className="grid gap-4 px-5 py-5 transition duration-200 hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"
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
            )) : (
              <div className="px-5 py-5 text-sm font-medium text-slate-500 sm:px-6">
                {isLoadingTrips ? 'Loading your trips...' : 'No trips yet. Create your first trip to start planning.'}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Travel insights</p>
              <h2 className="text-lg font-semibold text-slate-950">Planning health</h2>
            </div>
            <span className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <Sparkles size={20} aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {[
              ['Best planning path', 'Open Japan, export PDF, then checklist'],
              ['Backend API', 'Trips persist in MySQL through authenticated requests'],
              ['Share readiness', `${publicTrips} public itinerary${publicTrips === 1 ? '' : 'ies'}`],
            ].map(([label, detail]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">AI recommendations</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Turn intent into a route
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            A frontend-only planning preview that shows the AI itinerary moment without requiring
            backend services.
          </p>
        </div>
        <AITripGenerator />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Upcoming adventures</p>
              <h2 className="text-lg font-semibold text-slate-950">Ready to present</h2>
            </div>
            <span className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <Clock3 size={20} aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {upcomingTrips.length > 0 ? upcomingTrips.map((trip) => (
              <Link
                key={trip.id}
                to={`/trips/${trip.id}/view`}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/80"
              >
                <p className="font-semibold text-slate-950">{trip.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDateRange(trip.startDate, trip.endDate)}
                </p>
              </Link>
            )) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-500">
                {isLoadingTrips ? 'Loading upcoming trips...' : 'No upcoming trips yet.'}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Destination ideas</p>
              <h2 className="text-lg font-semibold text-slate-950">AI-inspired starts</h2>
            </div>
            <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <MapPin size={20} aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {recommendations.map((destination) => (
              <div
                key={destination.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md hover:shadow-slate-200/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">{destination.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{destination.tone}</p>
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
    </div>
  );
}

export default Dashboard;

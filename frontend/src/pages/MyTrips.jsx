import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckSquare, Eye, Luggage, PlusCircle, Sparkles } from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import { LoadingCards } from '../components/shared/LoadingSpinner.jsx';
import { formatDateRange, getTrips } from '../utils/tripStorage.js';

function MyTrips() {
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTrips(getTrips());
      setIsLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm shadow-slate-200/70 backdrop-blur sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            My Trips
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Your travel workspace
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Browse saved trips, jump into itineraries, and keep packing lists moving.
          </p>
        </div>
        <Button as={Link} to="/trips/new" size="lg" className="w-full sm:w-auto">
          <PlusCircle size={17} aria-hidden="true" />
          Create New Trip
        </Button>
      </header>

      {isLoading ? (
        <LoadingCards count={3} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Luggage}
          eyebrow="Your first journey starts here"
          title="No trips planned yet"
          description="Create a trip to unlock an itinerary, smart budget, checklist, notes, and share actions in one place."
          action={{ label: 'Create New Trip', to: '/trips/new' }}
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Trips saved', value: trips.length },
              { label: 'Public plans', value: trips.filter((trip) => trip.visibility === 'public').length },
              { label: 'AI-ready cards', value: trips.length },
            ].map((item) => (
              <Card key={item.label} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">{item.value}</p>
                  </div>
                  <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <Sparkles size={18} aria-hidden="true" />
                  </span>
                </div>
              </Card>
            ))}
          </section>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden p-0">
              <div className={['h-36 bg-gradient-to-br p-5 text-white', trip.coverTheme].join(' ')}>
                <div className="flex h-full flex-col justify-between">
                  <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize backdrop-blur">
                    {trip.visibility}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      Traveloop
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-2xl font-semibold tracking-tight">
                      {trip.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <CalendarDays size={16} aria-hidden="true" />
                  {formatDateRange(trip.startDate, trip.endDate)}
                </div>

                <p className="line-clamp-3 min-h-16 text-sm leading-6 text-slate-500">
                  {trip.description || 'No description yet. Open the itinerary to start shaping the route.'}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button as={Link} to={`/trips/${trip.id}/view`} variant="secondary">
                    <Eye size={16} aria-hidden="true" />
                    View Trip
                  </Button>
                  <Button as={Link} to={`/trips/${trip.id}/checklist`} variant="secondary">
                    <CheckSquare size={16} aria-hidden="true" />
                    Checklist
                  </Button>
                </div>
              </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyTrips;

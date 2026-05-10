import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Luggage, MapPinned } from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';

const trips = [
  { id: 'japan-explorer', name: 'Japan Explorer', dates: '12 days', stops: 'Tokyo, Kyoto, Osaka' },
  { id: 'europe-escape', name: 'Europe Escape', dates: '18 days', stops: 'Paris, Rome, Prague' },
  { id: 'himachal-adventure', name: 'Himachal Adventure', dates: '7 days', stops: 'Manali, Kasol, Shimla' },
];

const destinations = [
  { name: 'Tokyo', description: 'Neon nights, food alleys, and calm temple mornings.' },
  { name: 'Paris', description: 'Classic museums, riverside walks, and cafe hopping.' },
  { name: 'Manali', description: 'Mountain air, scenic drives, and adventure trails.' },
  { name: 'Bali', description: 'Beaches, rice terraces, and relaxed island stays.' },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              Travel planning hub
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">
              Welcome back to Traveloop
            </h1>
            <p className="mt-3 text-base text-[var(--color-text-secondary)]">
              Keep itineraries, packing lists, and travel notes organized in one focused workspace.
            </p>
          </div>
          <Button as={Link} className="w-full sm:w-auto" to="/trips/new">
            Plan New Trip
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Trip overview</p>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Upcoming plans</h2>
          </div>
          <Link to="/trips" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            View all
          </Link>
        </div>

        {trips.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{trip.name}</h3>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{trip.stops}</p>
                  </div>
                  <span className="rounded-full bg-[var(--color-surface)] p-2 text-[var(--color-primary)]">
                    <CalendarDays size={18} aria-hidden="true" />
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">{trip.dates}</span>
                  <Link
                    to={`/trips/${trip.id}/view`}
                    className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    Open itinerary
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Luggage}
            title="No trips planned yet"
            description="Start by creating your first trip and Traveloop will keep the details organized."
            action={{ label: 'Plan New Trip', to: '/trips/new' }}
          />
        )}
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Recommended destinations</p>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Ideas for your next loop</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination) => (
            <Card key={destination.name} className="space-y-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-surface)] text-[var(--color-primary)]">
                <MapPinned size={19} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{destination.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{destination.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

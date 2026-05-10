import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Compass, MapPin, WalletCards } from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import {
  formatDateRange,
  getTripBudgetTotal,
  getTripById,
  getTripDuration,
} from '../utils/tripStorage.js';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function PublicItinerary() {
  const { token } = useParams();
  const trip = getTripById(token);

  if (!trip) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            icon={MapPin}
            eyebrow="Share link unavailable"
            title="This shared itinerary is not available"
            description="The public preview uses the saved trip id as the share token. Open a saved trip and preview its share page again."
            action={{ label: 'Back to Traveloop', to: '/' }}
          />
        </div>
      </main>
    );
  }

  const budgetTotal = getTripBudgetTotal(trip.budget);
  const duration = getTripDuration(trip.startDate, trip.endDate);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className={['overflow-hidden rounded-[2rem] bg-gradient-to-br p-6 text-white shadow-2xl shadow-slate-300/50 sm:p-8', trip.coverTheme].join(' ')}>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Compass size={14} aria-hidden="true" />
                Shared Traveloop itinerary
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                {trip.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85">
                {trip.description || 'A share-ready AI travel plan with itinerary, budget, and trip context.'}
              </p>
            </div>
            <Button as={Link} to="/" variant="secondary" className="border-white/20 bg-white/95 text-slate-900 hover:bg-white">
              Back to Traveloop
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Dates', value: formatDateRange(trip.startDate, trip.endDate), icon: CalendarDays },
            { label: 'Duration', value: `${duration} day${duration === 1 ? '' : 's'}`, icon: MapPin },
            { label: 'Budget', value: formatCurrency(budgetTotal), icon: WalletCards },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
                </div>
                <span className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                  <Icon size={20} aria-hidden="true" />
                </span>
              </div>
            </Card>
          ))}
        </section>

        <Card interactive={false} className="p-0">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-sm font-medium text-slate-500">Preview timeline</p>
            <h2 className="text-lg font-semibold text-slate-950">Trip highlights</h2>
          </div>
          <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">
            {(trip.itinerary || []).slice(0, 3).map((day) => (
              <article key={`${day.day}-${day.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {day.day}
                </p>
                <h3 className="mt-2 font-semibold text-slate-950">{day.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{day.food}</p>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}

export default PublicItinerary;

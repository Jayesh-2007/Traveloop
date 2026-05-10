import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  CheckSquare,
  Clock3,
  Download,
  LoaderCircle,
  MapPin,
  Share2,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import {
  formatDateRange,
  getTripBudgetTotal,
  getTripById,
  getTripDuration,
} from '../utils/tripStorage.js';

const fallbackItinerary = [
  {
    day: 'Day 1',
    title: 'Arrival and neighborhood walk',
    activities: ['Check in', 'Save nearby cafes', 'Mark the first dinner spot'],
    food: 'Easy local dinner close to the stay',
    tip: 'Keep the first day light after arrival.',
  },
  {
    day: 'Day 2',
    title: 'Culture, landmarks, and local food',
    activities: ['Visit one major attraction', 'Plan a neighborhood walk', 'Add a relaxed lunch'],
    food: 'A local favorite restaurant or market stop',
    tip: 'Group activities by neighborhood to reduce travel time.',
  },
  {
    day: 'Day 3',
    title: 'Day trip or slow exploration',
    activities: ['Choose a scenic escape', 'Add shopping time', 'Capture notes for sharing'],
    food: 'Casual dinner near the return route',
    tip: 'Save offline maps and booking confirmations before departure.',
  },
];

const budgetConfig = [
  { key: 'hotel', label: 'Hotel estimate', tone: 'bg-emerald-600' },
  { key: 'food', label: 'Food estimate', tone: 'bg-amber-500' },
  { key: 'transport', label: 'Transport estimate', tone: 'bg-sky-500' },
  { key: 'activities', label: 'Activities estimate', tone: 'bg-violet-500' },
];

const defaultBudget = {
  hotel: 840,
  food: 320,
  transport: 210,
  activities: 280,
};

const travelTips = [
  'Keep the first day light after arrival.',
  'Group activities by neighborhood to reduce travel time.',
  'Save offline maps and booking confirmations before departure.',
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getProgressWidthClass(value, total) {
  if (!total) return 'w-0';

  const percentage = Math.round((value / total) * 100);
  if (percentage >= 90) return 'w-11/12';
  if (percentage >= 75) return 'w-3/4';
  if (percentage >= 66) return 'w-2/3';
  if (percentage >= 50) return 'w-1/2';
  if (percentage >= 33) return 'w-1/3';
  if (percentage >= 25) return 'w-1/4';
  if (percentage > 0) return 'w-1/12';
  return 'w-0';
}

function ItineraryView() {
  const { id } = useParams();
  const trip = getTripById(id);
  const [isExporting, setIsExporting] = useState(false);

  if (!trip) {
    return (
      <EmptyState
        icon={MapPin}
        title="Trip not found"
        description="This itinerary may have been removed from local storage. Create a new trip to continue the demo flow."
        action={{ label: 'Back to My Trips', to: '/trips' }}
      />
    );
  }

  const duration = getTripDuration(trip.startDate, trip.endDate);
  const timeline = Array.isArray(trip.itinerary) && trip.itinerary.length > 0 ? trip.itinerary : fallbackItinerary;
  const budget = trip.budget || defaultBudget;
  const budgetTotal = getTripBudgetTotal(budget);

  function handleShareTrip() {
    toast.success('Share link copied for demo.');
    console.log('Mock share URL:', `/share/${trip.id}`);
  }

  function handleExportPdf() {
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);
      toast.success('Mock PDF export ready.');
      console.log('Mock PDF export:', trip);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <section className={['overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl shadow-slate-300/40 sm:p-8', trip.coverTheme].join(' ')}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize backdrop-blur">
              {trip.visibility}
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
              {trip.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/85">
              {trip.description || 'A fresh itinerary ready for routes, activities, and travel notes.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={handleShareTrip}
              className="border-white/20 bg-white/95 text-slate-900 hover:bg-white"
            >
              <Share2 size={17} aria-hidden="true" />
              Share Trip
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="border-white/20 bg-white/95 text-slate-900 hover:bg-white"
            >
              {isExporting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                  Exporting
                </>
              ) : (
                <>
                  <Download size={17} aria-hidden="true" />
                  Export PDF
                </>
              )}
            </Button>
            <Button as={Link} to={`/trips/${trip.id}/checklist`} variant="secondary" className="border-white/20 bg-white/95 text-slate-900 hover:bg-white">
              <CheckSquare size={17} aria-hidden="true" />
              Checklist
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Dates', value: formatDateRange(trip.startDate, trip.endDate), icon: CalendarDays },
          { label: 'Duration', value: `${duration} day${duration === 1 ? '' : 's'}`, icon: Clock3 },
          { label: 'Budget', value: formatCurrency(budgetTotal), icon: WalletCards },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-semibold capitalize text-slate-950">{value}</p>
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
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <p className="text-sm font-medium text-slate-500">AI-assisted itinerary</p>
            <h2 className="text-lg font-semibold text-slate-950">Suggested timeline</h2>
          </div>
          <div className="space-y-0 p-5 sm:p-6">
            {timeline.map((item, index) => (
              <div key={`${item.day}-${item.title}`} className="grid grid-cols-[auto_1fr] gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700">
                    {index + 1}
                  </span>
                  {index < timeline.length - 1 && <span className="h-full w-px bg-slate-200" />}
                </div>
                <div className="pb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {item.day}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">{item.title}</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {(item.activities || []).slice(0, 3).map((activity) => (
                      <div key={activity} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-600">
                        {activity}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      <span className="font-semibold">Food: </span>
                      {item.food}
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                      <span className="font-semibold">Tip: </span>
                      {item.tip}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Smart budget</p>
                <h2 className="text-lg font-semibold text-slate-950">Estimated spend</h2>
              </div>
              <span className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <WalletCards size={20} aria-hidden="true" />
              </span>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-medium text-slate-300">Total estimated budget</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(budgetTotal)}</p>
            </div>

            <div className="mt-6 space-y-5">
              {budgetConfig.map(({ key, label, tone }) => {
                const value = Number(budget[key] || 0);

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium text-slate-600">{label}</span>
                      <span className="font-semibold text-slate-950">{formatCurrency(value)}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={[
                          'h-full rounded-full transition-all duration-500',
                          tone,
                          getProgressWidthClass(value, budgetTotal),
                        ].join(' ')}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Sparkles size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-500">Travel tips</p>
                <h2 className="text-lg font-semibold text-slate-950">Before you go</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {travelTips.map((tip) => (
                <div key={tip} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {tip}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default ItineraryView;

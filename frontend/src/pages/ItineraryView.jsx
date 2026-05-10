import { Link, useParams } from 'react-router-dom';
import { CalendarDays, CheckSquare, Clock3, MapPin, WalletCards } from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import { formatDateRange, getTripById, getTripDuration } from '../utils/tripStorage.js';

const itinerary = [
  {
    day: 'Day 1',
    title: 'Arrival and neighborhood walk',
    detail: 'Check in, save nearby cafes, and mark the first dinner spot.',
  },
  {
    day: 'Day 2',
    title: 'Culture, landmarks, and local food',
    detail: 'Anchor the day around one major attraction and keep the afternoon flexible.',
  },
  {
    day: 'Day 3',
    title: 'Day trip or slow exploration',
    detail: 'Use this day for a nearby escape, shopping street, or scenic viewpoint.',
  },
];

const travelTips = [
  'Keep the first day light after arrival.',
  'Group activities by neighborhood to reduce travel time.',
  'Save offline maps and booking confirmations before departure.',
];

function ItineraryView() {
  const { id } = useParams();
  const trip = getTripById(id);

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

  return (
    <div className="space-y-6">
      <section className={['overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-sm sm:p-8', trip.coverTheme].join(' ')}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize backdrop-blur">
              {trip.visibility}
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
              {trip.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80">
              {trip.description || 'A fresh itinerary ready for routes, activities, and travel notes.'}
            </p>
          </div>
          <Button as={Link} to={`/trips/${trip.id}/checklist`} variant="secondary" className="bg-white/95">
            <CheckSquare size={17} aria-hidden="true" />
            Open Checklist
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Dates', value: formatDateRange(trip.startDate, trip.endDate), icon: CalendarDays },
          { label: 'Duration', value: `${duration} day${duration === 1 ? '' : 's'}`, icon: Clock3 },
          { label: 'Visibility', value: trip.visibility, icon: MapPin },
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
            <p className="text-sm font-medium text-slate-500">Mock itinerary</p>
            <h2 className="text-lg font-semibold text-slate-950">Suggested timeline</h2>
          </div>
          <div className="space-y-0 p-5 sm:p-6">
            {itinerary.map((item, index) => (
              <div key={item.day} className="grid grid-cols-[auto_1fr] gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700">
                    {index + 1}
                  </span>
                  {index < itinerary.length - 1 && <span className="h-full w-px bg-slate-200" />}
                </div>
                <div className="pb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {item.day}
                  </p>
                  <h3 className="mt-1 font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Budget overview</p>
                <h2 className="text-lg font-semibold text-slate-950">Mock estimate</h2>
              </div>
              <span className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <WalletCards size={20} aria-hidden="true" />
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {[
                ['Stay', '$840'],
                ['Food', '$320'],
                ['Transit', '$180'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-medium text-slate-500">Travel tips</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">Before you go</h2>
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

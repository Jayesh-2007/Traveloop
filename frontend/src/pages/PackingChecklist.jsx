import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, FileText, Laptop, Luggage, Shirt, Sparkles } from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import { formatDateRange, getTripById } from '../utils/tripStorage.js';

const checklistTemplate = [
  {
    category: 'Essentials',
    icon: Sparkles,
    items: ['Phone charger', 'Daily medication', 'Reusable water bottle', 'Toiletries kit'],
  },
  {
    category: 'Clothing',
    icon: Shirt,
    items: ['Comfortable shoes', 'Weather layers', 'Sleepwear', 'Laundry pouch'],
  },
  {
    category: 'Electronics',
    icon: Laptop,
    items: ['Power bank', 'Camera', 'Travel adapter', 'Headphones'],
  },
  {
    category: 'Documents',
    icon: FileText,
    items: ['Passport or ID', 'Booking confirmations', 'Travel insurance', 'Emergency contacts'],
  },
];

function getChecklistStorageKey(tripId) {
  return `traveloop.checklist.${tripId}`;
}

function getInitialChecklist(tripId) {
  try {
    const storedChecklist = localStorage.getItem(getChecklistStorageKey(tripId));
    return storedChecklist ? JSON.parse(storedChecklist) : {};
  } catch (error) {
    console.error('Unable to read checklist from localStorage:', error);
    return {};
  }
}

function getProgressWidthClass(completion) {
  if (completion >= 100) return 'w-full';
  if (completion >= 90) return 'w-11/12';
  if (completion >= 75) return 'w-3/4';
  if (completion >= 66) return 'w-2/3';
  if (completion >= 50) return 'w-1/2';
  if (completion >= 33) return 'w-1/3';
  if (completion >= 25) return 'w-1/4';
  if (completion > 0) return 'w-1/12';
  return 'w-0';
}

function PackingChecklist() {
  const { id } = useParams();
  const trip = getTripById(id);
  const [checkedItems, setCheckedItems] = useState(() => getInitialChecklist(id));

  useEffect(() => {
    localStorage.setItem(getChecklistStorageKey(id), JSON.stringify(checkedItems));
  }, [checkedItems, id]);

  const allItems = useMemo(
    () =>
      checklistTemplate.flatMap((section) =>
        section.items.map((item) => ({
          id: `${section.category}-${item}`,
          label: item,
          category: section.category,
        })),
      ),
    [],
  );

  if (!trip) {
    return (
      <EmptyState
        icon={Luggage}
        title="Trip not found"
        description="This checklist belongs to a trip that is not currently saved in local storage."
        action={{ label: 'Back to My Trips', to: '/trips' }}
      />
    );
  }

  const completedCount = allItems.filter((item) => checkedItems[item.id]).length;
  const completion = Math.round((completedCount / allItems.length) * 100);

  function toggleItem(itemId) {
    setCheckedItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-sm shadow-slate-200/70 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Packing checklist
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Pack for {trip.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to={`/trips/${trip.id}/view`} variant="secondary">
              View Itinerary
            </Button>
            <Button as={Link} to={`/trips/${trip.id}/notes`} variant="secondary">
              Trip Notes
            </Button>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Progress</span>
            <span className="font-semibold text-emerald-700">{completion}% complete</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={[
                'h-full rounded-full bg-emerald-600 transition-all duration-300',
                getProgressWidthClass(completion),
              ].join(' ')}
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {completedCount} of {allItems.length} items packed
          </p>
        </div>
      </section>

      {completion === 0 && (
        <section className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/70 p-5 shadow-sm shadow-emerald-100/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm shadow-emerald-100">
                <Luggage size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-950">Start with essentials</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Check off your must-haves first so progress stays with the trip across sessions.
                </p>
              </div>
            </div>
            <Button as={Link} to={`/trips/${trip.id}/view`} variant="secondary" className="bg-white">
              Review itinerary
            </Button>
          </div>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        {checklistTemplate.map(({ category, icon: Icon, items }) => (
          <Card key={category}>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-950">{category}</h2>
                <p className="text-sm text-slate-500">{items.length} items</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {items.map((item) => {
                const itemId = `${category}-${item}`;
                const isChecked = Boolean(checkedItems[itemId]);

                return (
                  <label
                    key={itemId}
                    className={[
                      'flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition',
                      isChecked
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(itemId)}
                      className="h-5 w-5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700/20"
                    />
                    <span
                      className={[
                        'flex-1 text-sm font-medium',
                        isChecked ? 'text-emerald-800 line-through decoration-emerald-700/40' : 'text-slate-700',
                      ].join(' ')}
                    >
                      {item}
                    </span>
                    {isChecked && <CheckCircle2 size={18} className="text-emerald-700" aria-hidden="true" />}
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}

export default PackingChecklist;

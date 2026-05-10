import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, LoaderCircle, MapPin, Sparkles, WalletCards } from 'lucide-react';
import Button from './shared/Button.jsx';
import Card from './shared/Card.jsx';

const travelStyles = ['Balanced', 'Culture', 'Adventure', 'Foodie', 'Relaxed'];
const budgetLevels = ['Smart', 'Comfort', 'Premium'];

const activityPlaybooks = {
  Balanced: ['landmark walk', 'local cafe pause', 'golden-hour viewpoint'],
  Culture: ['museum block', 'historic district walk', 'evening performance'],
  Adventure: ['scenic trail', 'guided outdoor activity', 'sunset lookout'],
  Foodie: ['market tasting route', 'chef-recommended lunch', 'dessert crawl'],
  Relaxed: ['slow breakfast', 'spa or wellness stop', 'unhurried waterfront walk'],
};

function buildGeneratedItinerary({ destination, travelStyle, budget, days }) {
  const place = destination.trim() || 'Tokyo';
  const dayCount = Math.max(3, Math.min(Number(days) || 3, 7));
  const activities = activityPlaybooks[travelStyle] || activityPlaybooks.Balanced;

  return Array.from({ length: dayCount }, (_, index) => {
    const dayNumber = index + 1;
    const focus =
      index % 3 === 0
        ? `Arrive in ${place} and settle into the best neighborhood`
        : index % 3 === 1
          ? `Explore ${place} through ${travelStyle.toLowerCase()} experiences`
          : `Add a flexible day trip from ${place}`;

    return {
      day: `Day ${dayNumber}`,
      title: focus,
      activities: activities.map((activity) => `${place} ${activity}`),
      food:
        budget === 'Premium'
          ? `Reserve a polished ${place} dinner spot`
          : budget === 'Comfort'
            ? `Try a loved local restaurant in ${place}`
            : `Build a street-food and cafe route in ${place}`,
      tip:
        dayNumber === 1
          ? 'Keep arrival day intentionally light and book only one anchor activity.'
          : 'Group stops by neighborhood so the itinerary feels calm instead of rushed.',
    };
  });
}

function AITripGenerator() {
  const timerRef = useRef(null);
  const [formData, setFormData] = useState({
    destination: 'Tokyo',
    travelStyle: 'Balanced',
    budget: 'Comfort',
    days: 3,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleGenerate(event) {
    event.preventDefault();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsGenerating(true);
    setGeneratedItinerary([]);

    timerRef.current = setTimeout(() => {
      setGeneratedItinerary(buildGeneratedItinerary(formData));
      setIsGenerating(false);
    }, 2000);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-slate-200 bg-slate-950 p-6 text-white sm:p-7 lg:border-b-0 lg:border-r lg:border-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            <Sparkles size={14} aria-hidden="true" />
            AI travel copilot
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">
            Build a polished itinerary draft in seconds.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Destination, style, budget, and travel length become day cards with activities, food
            ideas, and practical tips for faster planning.
          </p>

          <form onSubmit={handleGenerate} className="mt-6 space-y-4">
            <div>
              <label htmlFor="ai-destination" className="text-sm font-semibold text-slate-100">
                Destination
              </label>
              <input
                id="ai-destination"
                name="destination"
                type="text"
                value={formData.destination}
                onChange={updateField}
                placeholder="Tokyo"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ai-style" className="text-sm font-semibold text-slate-100">
                  Travel style
                </label>
                <select
                  id="ai-style"
                  name="travelStyle"
                  value={formData.travelStyle}
                  onChange={updateField}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/10"
                >
                  {travelStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ai-budget" className="text-sm font-semibold text-slate-100">
                  Budget
                </label>
                <select
                  id="ai-budget"
                  name="budget"
                  value={formData.budget}
                  onChange={updateField}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/10"
                >
                  {budgetLevels.map((budget) => (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ai-days" className="text-sm font-semibold text-slate-100">
                Number of days
              </label>
              <input
                id="ai-days"
                name="days"
                type="number"
                min="3"
                max="7"
                value={formData.days}
                onChange={updateField}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-300/10"
              />
            </div>

            <Button type="submit" disabled={isGenerating} className="w-full bg-emerald-500 hover:bg-emerald-400">
              {isGenerating ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                  Generating itinerary
                </>
              ) : (
                <>
                  <Sparkles size={17} aria-hidden="true" />
                  Generate Trip
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="bg-white p-6 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Generated plan</p>
              <h3 className="text-lg font-semibold text-slate-950">
                {generatedItinerary.length > 0 ? `${formData.destination} itinerary` : 'Ready for AI draft'}
              </h3>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <WalletCards size={14} aria-hidden="true" />
              {formData.budget} budget
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {isGenerating &&
              [1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="shimmer h-4 w-20 rounded-full bg-slate-200" />
                  <div className="shimmer mt-4 h-5 w-3/4 rounded-full bg-slate-200" />
                  <div className="shimmer mt-3 h-3 w-full rounded-full bg-slate-200" />
                  <div className="shimmer mt-2 h-3 w-2/3 rounded-full bg-slate-200" />
                </div>
              ))}

            {!isGenerating && generatedItinerary.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm shadow-slate-200">
                  <MapPin size={22} aria-hidden="true" />
                </span>
                <h4 className="mt-4 font-semibold text-slate-950">No generated plan yet</h4>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose a destination and let Traveloop draft a polished itinerary preview.
                </p>
              </div>
            )}

            {!isGenerating &&
              generatedItinerary.map((day) => (
                <article
                  key={day.day}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/80"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CalendarDays size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        {day.day}
                      </p>
                      <h4 className="mt-1 font-semibold text-slate-950">{day.title}</h4>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">Activities: </span>
                      {day.activities.join(', ')}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Food: </span>
                      {day.food}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">Tip: </span>
                      {day.tip}
                    </p>
                  </div>
                </article>
              ))}

            {!isGenerating && generatedItinerary.length > 0 && (
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium leading-6 text-emerald-900">
                  Like this route? Save a trip to open itinerary, budget, checklist, and share tools.
                </p>
                <Button as={Link} to="/trips/new" variant="secondary" className="border-emerald-200 bg-white">
                  Create Trip
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AITripGenerator;

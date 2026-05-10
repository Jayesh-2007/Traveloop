import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  Compass,
  Copy,
  LoaderCircle,
  LogIn,
  MapPin,
  WalletCards,
} from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import ErrorMessage from '../components/shared/ErrorMessage.jsx';
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx';
import useAuth from '../hooks/useAuth.js';
import { formatDateRange, getTripDuration } from '../utils/tripStorage.js';
import { copyPublicTrip, fetchPublicItinerary, getApiErrorMessage } from '../utils/tripApi.js';

const coverThemes = [
  'from-emerald-500 via-teal-500 to-sky-500',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-indigo-500 via-violet-500 to-fuchsia-500',
  'from-sky-500 via-cyan-500 to-emerald-500',
];

function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getCoverTheme(id) {
  const numericId = Number(id);
  const index = Number.isInteger(numericId) ? numericId % coverThemes.length : 0;
  return coverThemes[index];
}

function getActivityTotal(stops = []) {
  return stops.reduce(
    (total, stop) => total + (stop.activities || []).reduce(
      (stopTotal, activity) => stopTotal + Number(activity.estimated_cost || 0),
      0,
    ),
    0,
  );
}

function PublicItinerary() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { isAuthenticated } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopyingTrip, setIsCopyingTrip] = useState(false);
  const [isCopyingLink, setIsCopyingLink] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPublicItinerary() {
      setIsLoading(true);
      setError('');

      try {
        const fetchedItinerary = await fetchPublicItinerary(token);

        if (isMounted) {
          setItinerary(fetchedItinerary);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError, 'This shared itinerary is not available.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPublicItinerary();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleCopyLink() {
    const shareUrl = window.location.href;
    setIsCopyingLink(true);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        window.prompt('Copy this share link:', shareUrl);
      }

      toast.success('Share link copied.');
    } finally {
      setIsCopyingLink(false);
    }
  }

  async function handleCopyTrip() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/share/${token}`)}`);
      return;
    }

    setIsCopyingTrip(true);
    setError('');

    try {
      const copyResult = await copyPublicTrip(token);
      toast.success('Trip copied to your account.');
      navigate(`/trips/${copyResult.trip_id}/view`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to copy this trip.'));
    } finally {
      setIsCopyingTrip(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
        <div className="mx-auto flex min-h-80 max-w-3xl items-center justify-center">
          <LoadingSpinner label="Loading shared itinerary" />
        </div>
      </main>
    );
  }

  if (!itinerary) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
        <div className="mx-auto max-w-3xl space-y-4">
          {error && <ErrorMessage message={error} />}
          <EmptyState
            icon={MapPin}
            eyebrow="Share link unavailable"
            title="This shared itinerary is not available"
            description="The share link may be invalid, expired, or disabled by the trip owner."
            action={{ label: 'Back to Traveloop', to: '/' }}
          />
        </div>
      </main>
    );
  }

  const { trip, stops = [], totals = {}, budget_summary: budgetSummary = {} } = itinerary;
  const duration = getTripDuration(trip.start_date, trip.end_date);
  const activityTotal = budgetSummary.estimated_activities_cost ?? getActivityTotal(stops);
  const currency = budgetSummary.currency_code || 'USD';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {error && <ErrorMessage message={error} />}

        <section className={['overflow-hidden rounded-[2rem] bg-gradient-to-br p-6 text-white shadow-2xl shadow-slate-300/50 sm:p-8', getCoverTheme(trip.id)].join(' ')}>
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
                {trip.description || 'A share-ready travel plan with itinerary, budget, and trip context.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopyLink}
                disabled={isCopyingLink}
                className="border-white/20 bg-white/95 text-slate-900 hover:bg-white"
              >
                {isCopyingLink ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
                Copy Link
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCopyTrip}
                disabled={isCopyingTrip}
                className="border-white/20 bg-white/95 text-slate-900 hover:bg-white"
              >
                {isCopyingTrip ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <LogIn size={17} aria-hidden="true" />}
                {isAuthenticated ? 'Copy Trip' : 'Log in to Copy'}
              </Button>
              <Button as={Link} to="/" variant="secondary" className="border-white/20 bg-white/95 text-slate-900 hover:bg-white">
                Back to Traveloop
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Dates', value: formatDateRange(trip.start_date, trip.end_date), icon: CalendarDays },
            { label: 'Duration', value: `${duration} day${duration === 1 ? '' : 's'}`, icon: MapPin },
            { label: 'Activity budget', value: formatCurrency(activityTotal, currency), icon: WalletCards },
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
            <p className="text-sm font-medium text-slate-500">Public itinerary</p>
            <h2 className="text-lg font-semibold text-slate-950">Stops and activities</h2>
          </div>
          <div className="space-y-0 p-5 sm:p-6">
            {stops.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <MapPin size={28} className="mx-auto text-emerald-700" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">No stops shared yet</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  This trip is public, but the owner has not added itinerary stops yet.
                </p>
              </div>
            ) : (
              stops.map((stop, index) => (
                <div key={stop.id} className="grid grid-cols-[auto_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700">
                      {index + 1}
                    </span>
                    {index < stops.length - 1 && <span className="h-full w-px bg-slate-200" />}
                  </div>
                  <div className="pb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Stop {stop.stop_order} - {formatDateRange(stop.start_date, stop.end_date)}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {stop.city?.name}, {stop.city?.country_name}
                    </h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {(stop.activities || []).length > 0 ? (
                        stop.activities.slice(0, 3).map((activity) => (
                          <article key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-600">
                            <span className="block font-semibold text-slate-900">{activity.name}</span>
                            <span className="mt-1 block text-xs text-slate-500">{activity.category || 'Activity'}</span>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-500 sm:col-span-3">
                          No activities shared for this stop yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card interactive={false}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Shared summary</p>
              <h2 className="text-lg font-semibold text-slate-950">
                {totals.stop_count || 0} stops, {totals.activity_count || 0} activities
              </h2>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Estimated activities: {formatCurrency(activityTotal, currency)}
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default PublicItinerary;

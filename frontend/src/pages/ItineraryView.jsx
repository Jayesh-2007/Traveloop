import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckSquare,
  Clock3,
  Download,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Save,
  Share2,
  Sparkles,
  StickyNote,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import ErrorMessage from '../components/shared/ErrorMessage.jsx';
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx';
import {
  formatDateRange,
  getTripBudgetTotal,
  getTripDuration,
} from '../utils/tripStorage.js';
import {
  assignActivityToStop,
  createStop,
  deleteStop,
  fetchActivitiesForCity,
  fetchCities,
  fetchItinerary,
  fetchTrip,
  getApiErrorMessage,
  reorderStops,
  updateStop,
} from '../utils/tripApi.js';

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
  activities: 0,
};

const initialStopForm = {
  cityId: '',
  startDate: '',
  endDate: '',
  stopOrder: '1',
};

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

function getStopTitle(stop) {
  const cityName = stop.city?.name || stop.city_name || 'Unknown city';
  const countryName = stop.city?.country_name || stop.country_name;

  return countryName ? `${cityName}, ${countryName}` : cityName;
}

function getStopActivityCost(stop) {
  return (stop.activities || []).reduce((total, activity) => total + Number(activity.estimated_cost || 0), 0);
}

function getStopActivityDuration(stop) {
  return (stop.activities || []).reduce((total, activity) => total + Number(activity.duration_minutes || 0), 0);
}

function buildTripWithItinerary(trip, itinerary) {
  const activityEstimate = itinerary.budget_summary?.estimated_activities_cost;

  return {
    ...trip,
    itineraryStops: itinerary.stops || [],
    itineraryTotals: itinerary.totals || {},
    stopCount: itinerary.totals?.stop_count ?? trip.stopCount,
    budget: {
      ...trip.budget,
      activities: activityEstimate ?? trip.budget?.activities ?? 0,
    },
  };
}

function getActivitySelection(selection = {}) {
  return {
    activityId: selection.activityId || '',
    scheduledDate: selection.scheduledDate || '',
    startTime: selection.startTime || '',
  };
}

function ItineraryView() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [cities, setCities] = useState([]);
  const [activityOptionsByStopId, setActivityOptionsByStopId] = useState({});
  const [activitySelections, setActivitySelections] = useState({});
  const [stopForm, setStopForm] = useState(initialStopForm);
  const [stopErrors, setStopErrors] = useState({});
  const [editStopId, setEditStopId] = useState(null);
  const [editStopForm, setEditStopForm] = useState(initialStopForm);
  const [editErrors, setEditErrors] = useState({});
  const [error, setError] = useState('');
  const [manageError, setManageError] = useState('');
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSavingStop, setIsSavingStop] = useState(false);
  const [isUpdatingStop, setIsUpdatingStop] = useState(false);
  const [deletingStopId, setDeletingStopId] = useState(null);
  const [reorderingStopId, setReorderingStopId] = useState(null);
  const [loadingActivitiesStopId, setLoadingActivitiesStopId] = useState(null);
  const [assigningActivityStopId, setAssigningActivityStopId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTrip() {
      setIsLoadingTrip(true);
      setError('');

      try {
        const [fetchedTrip, itinerary] = await Promise.all([
          fetchTrip(id),
          fetchItinerary(id),
        ]);

        if (isMounted) {
          setTrip(buildTripWithItinerary(fetchedTrip, itinerary));
          setStopForm((current) => ({
            ...current,
            stopOrder: String((itinerary.stops || []).length + 1),
          }));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError, 'Unable to load itinerary.'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingTrip(false);
        }
      }
    }

    async function loadCities() {
      setIsLoadingCities(true);

      try {
        const fetchedCities = await fetchCities({ limit: 50, sort: 'activities' });

        if (isMounted) {
          setCities(fetchedCities);
        }
      } catch (requestError) {
        if (isMounted) {
          setManageError(getApiErrorMessage(requestError, 'Unable to load city options.'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingCities(false);
        }
      }
    }

    loadTrip();
    loadCities();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function refreshItinerary() {
    const itinerary = await fetchItinerary(id);

    setTrip((currentTrip) => {
      if (!currentTrip) {
        return currentTrip;
      }

      return buildTripWithItinerary(currentTrip, itinerary);
    });

    setStopForm((current) => ({
      ...current,
      stopOrder: String((itinerary.stops || []).length + 1),
    }));

    return itinerary;
  }

  function validateStopForm(formData, maxOrder) {
    const nextErrors = {};

    if (!formData.cityId) {
      nextErrors.cityId = 'Choose a city.';
    }

    if (!formData.startDate) {
      nextErrors.startDate = 'Start date is required.';
    }

    if (!formData.endDate) {
      nextErrors.endDate = 'End date is required.';
    }

    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      nextErrors.endDate = 'End date must be after start date.';
    }

    const order = Number(formData.stopOrder);
    if (!Number.isInteger(order) || order < 1 || order > maxOrder) {
      nextErrors.stopOrder = `Order must be between 1 and ${maxOrder}.`;
    }

    return nextErrors;
  }

  function updateStopField(event) {
    const { name, value } = event.target;

    setStopForm((current) => ({
      ...current,
      [name]: value,
    }));

    setStopErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function updateEditStopField(event) {
    const { name, value } = event.target;

    setEditStopForm((current) => ({
      ...current,
      [name]: value,
    }));

    setEditErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  async function handleCreateStop(event) {
    event.preventDefault();
    setManageError('');

    const stops = trip?.itineraryStops || [];
    const validationErrors = validateStopForm(stopForm, stops.length + 1);
    setStopErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSavingStop(true);

    try {
      await createStop(id, stopForm);
      await refreshItinerary();
      setStopForm({ ...initialStopForm, stopOrder: String(stops.length + 2) });
      toast.success('Stop added.');
    } catch (requestError) {
      setManageError(getApiErrorMessage(requestError, 'Unable to add stop.'));
    } finally {
      setIsSavingStop(false);
    }
  }

  function startEditingStop(stop) {
    setEditStopId(stop.id);
    setEditErrors({});
    setEditStopForm({
      cityId: String(stop.city_id || stop.city?.id || ''),
      startDate: stop.start_date || '',
      endDate: stop.end_date || '',
      stopOrder: String(stop.stop_order || 1),
    });
  }

  function cancelEditingStop() {
    setEditStopId(null);
    setEditErrors({});
    setEditStopForm(initialStopForm);
  }

  async function handleUpdateStop(event) {
    event.preventDefault();
    setManageError('');

    const stops = trip?.itineraryStops || [];
    const validationErrors = validateStopForm(editStopForm, stops.length);
    setEditErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !editStopId) {
      return;
    }

    setIsUpdatingStop(true);

    try {
      await updateStop(id, editStopId, editStopForm);
      await refreshItinerary();
      cancelEditingStop();
      toast.success('Stop updated.');
    } catch (requestError) {
      setManageError(getApiErrorMessage(requestError, 'Unable to update stop.'));
    } finally {
      setIsUpdatingStop(false);
    }
  }

  async function handleDeleteStop(stop) {
    const shouldDelete = window.confirm(`Delete ${getStopTitle(stop)} from this itinerary?`);

    if (!shouldDelete) {
      return;
    }

    setManageError('');
    setDeletingStopId(stop.id);

    try {
      await deleteStop(id, stop.id);
      await refreshItinerary();
      toast.success('Stop deleted.');
    } catch (requestError) {
      setManageError(getApiErrorMessage(requestError, 'Unable to delete stop.'));
    } finally {
      setDeletingStopId(null);
    }
  }

  async function handleMoveStop(index, direction) {
    const stops = trip?.itineraryStops || [];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= stops.length) {
      return;
    }

    const nextStopIds = stops.map((stop) => stop.id);
    [nextStopIds[index], nextStopIds[targetIndex]] = [nextStopIds[targetIndex], nextStopIds[index]];

    setManageError('');
    setReorderingStopId(stops[index].id);

    try {
      await reorderStops(id, nextStopIds);
      await refreshItinerary();
      toast.success('Stop order updated.');
    } catch (requestError) {
      setManageError(getApiErrorMessage(requestError, 'Unable to reorder stops.'));
    } finally {
      setReorderingStopId(null);
    }
  }

  async function loadActivitiesForStop(stop) {
    if (activityOptionsByStopId[stop.id]) {
      return;
    }

    setManageError('');
    setLoadingActivitiesStopId(stop.id);

    try {
      const activities = await fetchActivitiesForCity(stop.city_id || stop.city?.id, { limit: 50 });
      setActivityOptionsByStopId((current) => ({
        ...current,
        [stop.id]: activities,
      }));
    } catch (requestError) {
      setManageError(getApiErrorMessage(requestError, 'Unable to load activities for this stop.'));
    } finally {
      setLoadingActivitiesStopId(null);
    }
  }

  function updateActivitySelection(stopId, field, value) {
    setActivitySelections((current) => ({
      ...current,
      [stopId]: {
        ...getActivitySelection(current[stopId]),
        [field]: value,
      },
    }));
  }

  async function handleAssignActivity(event, stop) {
    event.preventDefault();

    const selection = getActivitySelection(activitySelections[stop.id]);

    if (!selection.activityId) {
      setManageError('Choose an activity before adding it to the stop.');
      return;
    }

    setManageError('');
    setAssigningActivityStopId(stop.id);

    try {
      await assignActivityToStop(id, stop.id, selection);
      await refreshItinerary();
      setActivitySelections((current) => ({
        ...current,
        [stop.id]: getActivitySelection(),
      }));
      toast.success('Activity assigned.');
    } catch (requestError) {
      setManageError(getApiErrorMessage(requestError, 'Unable to assign activity.'));
    } finally {
      setAssigningActivityStopId(null);
    }
  }

  if (isLoadingTrip) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <LoadingSpinner label="Loading itinerary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        {error && <ErrorMessage message={error} />}
        <EmptyState
          icon={MapPin}
          title="Trip not found"
          description="This itinerary may have been removed or may not belong to your account."
          action={{ label: 'Back to My Trips', to: '/trips' }}
        />
      </div>
    );
  }

  const stops = trip.itineraryStops || [];
  const duration = getTripDuration(trip.startDate, trip.endDate);
  const budget = { ...defaultBudget, ...(trip.budget || {}) };
  const budgetTotal = getTripBudgetTotal(budget);
  const totals = trip.itineraryTotals || {};

  function handleShareTrip() {
    toast.success('Share link copied.');
    console.log('Share URL:', `/share/${trip.id}`);
  }

  function handleExportPdf() {
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);
      toast.success('PDF export ready.');
      console.log('PDF export:', trip);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}
      {manageError && <ErrorMessage message={manageError} />}

      <section className={['relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-6 text-white shadow-2xl shadow-slate-300/50 sm:p-8', trip.coverTheme].join(' ')}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:max-w-xl lg:justify-end lg:shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={handleShareTrip}
              className="border-white/20 bg-white/95 text-slate-900 hover:bg-white"
            >
              <Share2 size={17} aria-hidden="true" />
              Share Trip
            </Button>
            <Button as={Link} to={`/share/${trip.id}`} variant="secondary" className="border-white/20 bg-white/95 text-slate-900 hover:bg-white">
              <ExternalLink size={17} aria-hidden="true" />
              Preview Share
            </Button>
            <Button as={Link} to={`/trips/${trip.id}/edit`} variant="secondary" className="border-white/20 bg-white/95 text-slate-900 hover:bg-white">
              <Pencil size={17} aria-hidden="true" />
              Edit Trip
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
            <Button as={Link} to={`/trips/${trip.id}/notes`} variant="secondary" className="border-white/20 bg-white/95 text-slate-900 hover:bg-white">
              <StickyNote size={17} aria-hidden="true" />
              Notes
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Dates', value: formatDateRange(trip.startDate, trip.endDate), icon: CalendarDays },
          { label: 'Duration', value: `${duration} day${duration === 1 ? '' : 's'}`, icon: Clock3 },
          { label: 'Stops', value: `${totals.stop_count || 0} stop${totals.stop_count === 1 ? '' : 's'}`, icon: MapPin },
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
            <p className="text-sm font-medium text-slate-500">Trip itinerary</p>
            <h2 className="text-lg font-semibold text-slate-950">Stops and activities</h2>
          </div>

          <form onSubmit={handleCreateStop} className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_96px_auto] lg:items-end">
              <div>
                <label htmlFor="cityId" className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  City
                </label>
                <select
                  id="cityId"
                  name="cityId"
                  value={stopForm.cityId}
                  onChange={updateStopField}
                  disabled={isSavingStop || isLoadingCities}
                  className="traveloop-input mt-2"
                >
                  <option value="">{isLoadingCities ? 'Loading cities' : 'Choose city'}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.country_name}
                    </option>
                  ))}
                </select>
                {stopErrors.cityId && <p className="mt-2 text-xs font-semibold text-red-600">{stopErrors.cityId}</p>}
              </div>

              <div>
                <label htmlFor="startDate" className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Start
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={stopForm.startDate}
                  onChange={updateStopField}
                  disabled={isSavingStop}
                  className="traveloop-input mt-2"
                />
                {stopErrors.startDate && <p className="mt-2 text-xs font-semibold text-red-600">{stopErrors.startDate}</p>}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  End
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={stopForm.endDate}
                  onChange={updateStopField}
                  disabled={isSavingStop}
                  className="traveloop-input mt-2"
                />
                {stopErrors.endDate && <p className="mt-2 text-xs font-semibold text-red-600">{stopErrors.endDate}</p>}
              </div>

              <div>
                <label htmlFor="stopOrder" className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Order
                </label>
                <input
                  id="stopOrder"
                  name="stopOrder"
                  type="number"
                  min="1"
                  max={stops.length + 1}
                  value={stopForm.stopOrder}
                  onChange={updateStopField}
                  disabled={isSavingStop}
                  className="traveloop-input mt-2"
                />
                {stopErrors.stopOrder && <p className="mt-2 text-xs font-semibold text-red-600">{stopErrors.stopOrder}</p>}
              </div>

              <Button type="submit" disabled={isSavingStop || isLoadingCities} className="w-full lg:w-auto">
                {isSavingStop ? (
                  <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Plus size={17} aria-hidden="true" />
                )}
                Add Stop
              </Button>
            </div>
          </form>

          <div className="space-y-0 p-5 sm:p-6">
            {stops.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <MapPin size={28} className="mx-auto text-emerald-700" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">No stops yet</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Add the first city stop to start building this itinerary.
                </p>
              </div>
            ) : (
              stops.map((stop, index) => {
                const activities = stop.activities || [];
                const isEditing = editStopId === stop.id;
                const activityOptions = activityOptionsByStopId[stop.id] || [];
                const activitySelection = getActivitySelection(activitySelections[stop.id]);
                const activityCost = getStopActivityCost(stop);
                const activityDuration = getStopActivityDuration(stop);

                return (
                  <div key={stop.id} className="grid grid-cols-[auto_1fr] gap-4">
                    <div className="flex flex-col items-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700">
                        {index + 1}
                      </span>
                      {index < stops.length - 1 && <span className="h-full w-px bg-slate-200" />}
                    </div>
                    <div className="pb-8">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Stop {stop.stop_order} · {formatDateRange(stop.start_date, stop.end_date)}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-slate-950">{getStopTitle(stop)}</h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleMoveStop(index, -1)}
                            disabled={index === 0 || Boolean(reorderingStopId)}
                            aria-label="Move stop up"
                          >
                            {reorderingStopId === stop.id ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <ArrowUp size={15} aria-hidden="true" />}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleMoveStop(index, 1)}
                            disabled={index === stops.length - 1 || Boolean(reorderingStopId)}
                            aria-label="Move stop down"
                          >
                            {reorderingStopId === stop.id ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <ArrowDown size={15} aria-hidden="true" />}
                          </Button>
                          <Button type="button" variant="secondary" size="sm" onClick={() => startEditingStop(stop)} disabled={isUpdatingStop}>
                            <Pencil size={15} aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteStop(stop)}
                            disabled={deletingStopId === stop.id}
                          >
                            {deletingStopId === stop.id ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Trash2 size={15} aria-hidden="true" />}
                            Delete
                          </Button>
                        </div>
                      </div>

                      {isEditing && (
                        <form onSubmit={handleUpdateStop} className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_96px_auto_auto] lg:items-end">
                            <div>
                              <label htmlFor={`edit-city-${stop.id}`} className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                City
                              </label>
                              <select
                                id={`edit-city-${stop.id}`}
                                name="cityId"
                                value={editStopForm.cityId}
                                onChange={updateEditStopField}
                                disabled={isUpdatingStop || isLoadingCities}
                                className="traveloop-input mt-2"
                              >
                                <option value="">Choose city</option>
                                {cities.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}, {city.country_name}
                                  </option>
                                ))}
                              </select>
                              {editErrors.cityId && <p className="mt-2 text-xs font-semibold text-red-600">{editErrors.cityId}</p>}
                            </div>

                            <div>
                              <label htmlFor={`edit-start-${stop.id}`} className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Start
                              </label>
                              <input
                                id={`edit-start-${stop.id}`}
                                name="startDate"
                                type="date"
                                value={editStopForm.startDate}
                                onChange={updateEditStopField}
                                disabled={isUpdatingStop}
                                className="traveloop-input mt-2"
                              />
                              {editErrors.startDate && <p className="mt-2 text-xs font-semibold text-red-600">{editErrors.startDate}</p>}
                            </div>

                            <div>
                              <label htmlFor={`edit-end-${stop.id}`} className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                End
                              </label>
                              <input
                                id={`edit-end-${stop.id}`}
                                name="endDate"
                                type="date"
                                value={editStopForm.endDate}
                                onChange={updateEditStopField}
                                disabled={isUpdatingStop}
                                className="traveloop-input mt-2"
                              />
                              {editErrors.endDate && <p className="mt-2 text-xs font-semibold text-red-600">{editErrors.endDate}</p>}
                            </div>

                            <div>
                              <label htmlFor={`edit-order-${stop.id}`} className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Order
                              </label>
                              <input
                                id={`edit-order-${stop.id}`}
                                name="stopOrder"
                                type="number"
                                min="1"
                                max={stops.length}
                                value={editStopForm.stopOrder}
                                onChange={updateEditStopField}
                                disabled={isUpdatingStop}
                                className="traveloop-input mt-2"
                              />
                              {editErrors.stopOrder && <p className="mt-2 text-xs font-semibold text-red-600">{editErrors.stopOrder}</p>}
                            </div>

                            <Button type="submit" disabled={isUpdatingStop}>
                              {isUpdatingStop ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
                              Save
                            </Button>
                            <Button type="button" variant="secondary" onClick={cancelEditingStop} disabled={isUpdatingStop}>
                              <X size={17} aria-hidden="true" />
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {activities.length > 0 ? (
                          activities.slice(0, 3).map((activityItem) => (
                            <div key={activityItem.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-600">
                              <span className="block font-semibold text-slate-900">{activityItem.name}</span>
                              <span className="mt-1 block text-xs text-slate-500">{activityItem.category || 'Activity'}</span>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-500 sm:col-span-3">
                            No activities assigned yet.
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                          <span className="font-semibold">Activities: </span>
                          {activities.length} planned · {formatCurrency(activityCost)}
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                          <span className="font-semibold">Duration: </span>
                          {activityDuration > 0 ? `${Math.round(activityDuration / 60)} hr` : 'Not scheduled yet'}
                        </div>
                      </div>

                      <form onSubmit={(event) => handleAssignActivity(event, stop)} className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.75fr)_minmax(0,0.6fr)_auto] lg:items-end">
                          <div>
                            <label htmlFor={`activity-${stop.id}`} className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Activity
                            </label>
                            <select
                              id={`activity-${stop.id}`}
                              value={activitySelection.activityId}
                              onFocus={() => loadActivitiesForStop(stop)}
                              onChange={(event) => updateActivitySelection(stop.id, 'activityId', event.target.value)}
                              disabled={loadingActivitiesStopId === stop.id || assigningActivityStopId === stop.id}
                              className="traveloop-input mt-2"
                            >
                              <option value="">
                                {loadingActivitiesStopId === stop.id ? 'Loading activities' : 'Choose activity'}
                              </option>
                              {activityOptions.map((activityItem) => (
                                <option key={activityItem.id} value={activityItem.id}>
                                  {activityItem.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor={`scheduled-${stop.id}`} className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Date
                            </label>
                            <input
                              id={`scheduled-${stop.id}`}
                              type="date"
                              value={activitySelection.scheduledDate}
                              onChange={(event) => updateActivitySelection(stop.id, 'scheduledDate', event.target.value)}
                              disabled={assigningActivityStopId === stop.id}
                              className="traveloop-input mt-2"
                            />
                          </div>
                          <div>
                            <label htmlFor={`time-${stop.id}`} className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Time
                            </label>
                            <input
                              id={`time-${stop.id}`}
                              type="time"
                              value={activitySelection.startTime}
                              onChange={(event) => updateActivitySelection(stop.id, 'startTime', event.target.value)}
                              disabled={assigningActivityStopId === stop.id}
                              className="traveloop-input mt-2"
                            />
                          </div>
                          <Button type="submit" disabled={assigningActivityStopId === stop.id || loadingActivitiesStopId === stop.id}>
                            {assigningActivityStopId === stop.id ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Activity size={17} aria-hidden="true" />}
                            Add
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
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
                <p className="text-sm font-medium text-slate-500">Itinerary totals</p>
                <h2 className="text-lg font-semibold text-slate-950">Planner summary</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                `Stops: ${totals.stop_count || 0}`,
                `Activities: ${totals.activity_count || 0}`,
                `Activity cost: ${formatCurrency(totals.estimated_activities_cost || 0)}`,
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {item}
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

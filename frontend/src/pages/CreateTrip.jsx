import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Globe2, ImagePlus, LoaderCircle, LockKeyhole, PlaneTakeoff, Sparkles } from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import ErrorMessage from '../components/shared/ErrorMessage.jsx';
import { createTrip } from '../utils/tripStorage.js';

const DESCRIPTION_MAX_LENGTH = 420;

const initialFormState = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  visibility: 'private',
};

function CreateTrip() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageName, setCoverImageName] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  function validateForm() {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Trip name is required.';
    }

    if (!formData.startDate) {
      nextErrors.startDate = 'Start date is required.';
    }

    if (!formData.endDate) {
      nextErrors.endDate = 'End date is required.';
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      nextErrors.endDate = 'End date cannot be before the start date.';
    }

    return nextErrors;
  }

  function updateField(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[name];

      if (name === 'startDate') {
        delete nextErrors.endDate;
      }

      return nextErrors;
    });
  }

  function updateVisibility(visibility) {
    setFormData((current) => ({
      ...current,
      visibility,
    }));
  }

  function handleCoverImageChange(event) {
    const file = event.target.files?.[0];

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    if (!file) {
      setCoverImageName('');
      setCoverPreview('');
      return;
    }

    setCoverImageName(file.name);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const trip = createTrip({
        ...formData,
        coverImageName,
      });

      console.log('Created trip:', trip);
      toast.success('Trip created. Opening itinerary.');
      setIsSubmitting(false);
      navigate(`/trips/${trip.id}/view`);
    }, 950);
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm shadow-slate-200/70 backdrop-blur sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            New itinerary
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Create a trip
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Add the core details now. You can build the itinerary, checklist, and notes after the
            trip is saved.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900 sm:w-auto">
          <Sparkles size={18} className="shrink-0 text-emerald-700" aria-hidden="true" />
          <span className="font-medium">Starter AI itinerary is generated automatically.</span>
        </div>
      </header>

      <Card className="overflow-hidden p-0">
        <form onSubmit={handleSubmit} noValidate>
          <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
            <h2 className="text-lg font-semibold text-slate-950">Trip details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Make it easy to scan, share, and continue planning later.
            </p>
          </div>

          <div className="space-y-8 px-5 py-6 sm:px-7">
            {hasErrors && (
              <ErrorMessage message="Some details need attention before this trip can be created." />
            )}

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                    Trip name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={updateField}
                    placeholder="Summer Europe Adventure"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className="traveloop-input mt-2"
                    required
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-2 text-sm font-medium text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-end justify-between gap-4">
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-800">
                      Description
                    </label>
                    <span className="text-xs font-medium text-slate-400">
                      {formData.description.length}/{DESCRIPTION_MAX_LENGTH}
                    </span>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={updateField}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    rows={5}
                    placeholder="Add route ideas, travel style, must-see stops, or planning notes."
                    disabled={isSubmitting}
                    className="traveloop-input mt-2 resize-y"
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Optional, but helpful when you revisit the trip later.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-semibold text-slate-800">
                      Start date
                    </label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={updateField}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.startDate)}
                      aria-describedby={errors.startDate ? 'startDate-error' : undefined}
                      className="traveloop-input mt-2"
                      required
                    />
                    {errors.startDate && (
                      <p id="startDate-error" className="mt-2 text-sm font-medium text-red-600">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-semibold text-slate-800">
                      End date
                    </label>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={updateField}
                      min={formData.startDate || undefined}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.endDate)}
                      aria-describedby={errors.endDate ? 'endDate-error' : undefined}
                      className="traveloop-input mt-2"
                      required
                    />
                    {errors.endDate && (
                      <p id="endDate-error" className="mt-2 text-sm font-medium text-red-600">
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>

                <fieldset>
                  <legend className="text-sm font-semibold text-slate-800">Visibility</legend>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose whether this itinerary is private or ready to share.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        value: 'private',
                        label: 'Private',
                        description: 'Only visible in your workspace.',
                        icon: LockKeyhole,
                      },
                      {
                        value: 'public',
                        label: 'Public',
                        description: 'Ready for a shareable itinerary link.',
                        icon: Globe2,
                      },
                    ].map(({ value, label, description, icon: Icon }) => {
                      const isSelected = formData.visibility === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateVisibility(value)}
                          disabled={isSubmitting}
                          aria-pressed={isSelected}
                          className={[
                            'rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60',
                            isSelected
                              ? 'border-emerald-200 bg-emerald-50 shadow-sm shadow-emerald-900/5'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                          ].join(' ')}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={[
                                'inline-flex h-10 w-10 items-center justify-center rounded-xl',
                                isSelected
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-slate-100 text-slate-500',
                              ].join(' ')}
                            >
                              <Icon size={18} aria-hidden="true" />
                            </span>
                            <span className="font-semibold text-slate-950">{label}</span>
                          </span>
                          <span className="mt-3 block text-sm leading-5 text-slate-500">
                            {description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <aside className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Cover image</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Upload UI only for now. A generated color cover will be saved with the trip.
                  </p>
                </div>

                <label
                  htmlFor="coverImage"
                  className="group flex min-h-80 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="" className="h-full min-h-80 w-full object-cover" />
                  ) : (
                    <span className="flex flex-col items-center px-6">
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm shadow-slate-200/80 transition group-hover:scale-105">
                        <ImagePlus size={24} aria-hidden="true" />
                      </span>
                      <span className="mt-4 text-sm font-semibold text-slate-900">
                        Add a cover preview
                      </span>
                      <span className="mt-1 text-xs font-medium text-slate-500">PNG or JPG</span>
                    </span>
                  )}
                  <input
                    id="coverImage"
                    name="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                </label>

                {coverImageName && (
                  <p className="truncate text-xs font-medium text-slate-500">
                    Selected preview: {coverImageName}
                  </p>
                )}
              </aside>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/trips')}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                  Creating trip
                </>
              ) : (
                <>
                  <PlaneTakeoff size={17} aria-hidden="true" />
                  Create & Open Itinerary
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateTrip;

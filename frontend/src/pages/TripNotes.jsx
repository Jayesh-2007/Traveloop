import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { CheckSquare, MapPin, PlusCircle, StickyNote } from 'lucide-react';
import Button from '../components/shared/Button.jsx';
import Card from '../components/shared/Card.jsx';
import EmptyState from '../components/shared/EmptyState.jsx';
import { formatDateRange, getTripById } from '../utils/tripStorage.js';

function getNotesStorageKey(tripId) {
  return `traveloop.notes.${tripId}`;
}

function getInitialNotes(tripId) {
  try {
    const storedNotes = localStorage.getItem(getNotesStorageKey(tripId));
    const parsedNotes = storedNotes ? JSON.parse(storedNotes) : [];
    return Array.isArray(parsedNotes) ? parsedNotes : [];
  } catch (error) {
    console.error('Unable to read notes from localStorage:', error);
    return [];
  }
}

function TripNotes() {
  const { id } = useParams();
  const trip = getTripById(id);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState(() => getInitialNotes(id));

  useEffect(() => {
    localStorage.setItem(getNotesStorageKey(id), JSON.stringify(notes));
  }, [id, notes]);

  if (!trip) {
    return (
      <EmptyState
        icon={StickyNote}
        eyebrow="Notes unavailable"
        title="Trip notes not found"
        description="This notes board belongs to a trip that is not currently saved in local storage."
        action={{ label: 'Back to My Trips', to: '/trips' }}
      />
    );
  }

  function addNote(noteText = draft) {
    const text = noteText.trim();

    if (!text) {
      toast.error('Add a note before saving.');
      return;
    }

    setNotes((current) => [
      {
        id: `${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setDraft('');
    toast.success('Note saved.');
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-sm shadow-slate-200/70 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Trip Notes
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Notes for {trip.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Save restaurants, booking reminders, handoff context, and travel ideas.
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to={`/trips/${trip.id}/view`} variant="secondary">
              <MapPin size={17} aria-hidden="true" />
              Itinerary
            </Button>
            <Button as={Link} to={`/trips/${trip.id}/checklist`} variant="secondary">
              <CheckSquare size={17} aria-hidden="true" />
              Checklist
            </Button>
          </div>
        </div>
      </section>

      <Card interactive={false} className="p-0">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-950">Capture a travel thought</h2>
          <p className="mt-1 text-sm text-slate-500">
            Notes stay in localStorage for a stable frontend-only planning workspace.
          </p>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={5}
            placeholder="Example: Book a Gion tea house, confirm luggage forwarding, and keep day three flexible."
            className="traveloop-input resize-y"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">{notes.length} saved note{notes.length === 1 ? '' : 's'}</p>
            <Button type="button" onClick={() => addNote()} className="w-full sm:w-auto">
              <PlusCircle size={17} aria-hidden="true" />
              Save Note
            </Button>
          </div>
        </div>
      </Card>

      {notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          eyebrow="Fresh notes board"
          title="No notes saved yet"
          description="Add ideas, restaurant finds, booking reminders, or handoff context so this trip keeps moving."
          action={{
            label: 'Add Sample Note',
            onClick: () =>
              addNote('Confirm reservations, keep one flexible afternoon, and export the itinerary before sharing.'),
          }}
        />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <StickyNote size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm leading-6 text-slate-700">{note.text}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Saved {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(note.createdAt))}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

export default TripNotes;

import { Globe2, Sparkles, UserRound } from 'lucide-react';
import Card from '../components/shared/Card.jsx';

const preferences = [
  'Balanced itineraries',
  'Mid-range comfort budget',
  'Food and culture discovery',
  'Share-ready trip summaries',
];

function UserProfile() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-sm shadow-slate-200/70 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-lg shadow-slate-900/20">
            <UserRound size={32} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Profile
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Traveler preferences
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Travel defaults that show how Traveloop can personalize AI itinerary generation.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">AI profile</p>
              <h2 className="text-lg font-semibold text-slate-950">Planning style</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {preferences.map((preference) => (
              <div key={preference} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                {preference}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-sky-50 p-3 text-sky-700">
              <Globe2 size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Travel defaults</p>
              <h2 className="text-lg font-semibold text-slate-950">Demo-ready settings</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Home airport', 'DEL / flexible'],
              ['Preferred pace', '2-3 anchor plans per day'],
              ['Budget mode', 'Comfort'],
              ['Sharing', 'Public previews enabled'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

export default UserProfile;

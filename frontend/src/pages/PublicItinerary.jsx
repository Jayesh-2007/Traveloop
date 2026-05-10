import { Link, useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function PublicItinerary() {
  const { token } = useParams();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Shared Itinerary
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Public trip share
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Share token: {token}</p>
          <Link
            to="/"
            className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Back to Traveloop
          </Link>
        </Card>
      </div>
    </main>
  );
}

export default PublicItinerary;

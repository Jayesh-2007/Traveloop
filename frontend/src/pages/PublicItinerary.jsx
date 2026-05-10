import { Link, useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function PublicItinerary() {
  const { token } = useParams();

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-10 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-3xl">
        <Card>
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">Shared Itinerary</p>
          <h1 className="mt-2 text-2xl font-semibold">Public trip share</h1>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">Share token: {token}</p>
          <Link
            to="/"
            className="mt-6 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Back to Traveloop
          </Link>
        </Card>
      </div>
    </main>
  );
}

export default PublicItinerary;

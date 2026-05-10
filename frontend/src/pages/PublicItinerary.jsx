import { Link, useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function PublicItinerary() {
  const { token } = useParams();

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-10 text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-3xl">
        <Card title="Shared Itinerary">
          <p className="text-sm text-[var(--color-text-secondary)]">Public share token: {token}</p>
          <Link
            to="/"
            className="mt-6 inline-flex text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            Back to Traveloop
          </Link>
        </Card>
      </div>
    </main>
  );
}

export default PublicItinerary;

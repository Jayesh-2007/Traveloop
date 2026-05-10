import { useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function ItineraryView() {
  const { id } = useParams();

  return (
    <Card>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">Itinerary</p>
      <h1 className="mt-2 text-2xl font-semibold">Viewing trip {id}</h1>
    </Card>
  );
}

export default ItineraryView;

import { useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function ItineraryView() {
  const { id } = useParams();

  return (
    <Card title="Itinerary View">
      <p className="text-sm text-[var(--color-text-secondary)]">Viewing itinerary for trip {id}.</p>
    </Card>
  );
}

export default ItineraryView;

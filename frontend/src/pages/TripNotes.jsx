import { useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function TripNotes() {
  const { id } = useParams();

  return (
    <Card title="Trip Notes">
      <p className="text-sm text-[var(--color-text-secondary)]">Notes for trip {id} will live here.</p>
    </Card>
  );
}

export default TripNotes;

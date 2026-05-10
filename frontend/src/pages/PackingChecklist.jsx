import { useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function PackingChecklist() {
  const { id } = useParams();

  return (
    <Card title="Packing Checklist">
      <p className="text-sm text-[var(--color-text-secondary)]">Packing checklist for trip {id} will live here.</p>
    </Card>
  );
}

export default PackingChecklist;

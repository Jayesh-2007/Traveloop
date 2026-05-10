import { useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function PackingChecklist() {
  const { id } = useParams();

  return (
    <Card>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">Packing Checklist</p>
      <h1 className="mt-2 text-2xl font-semibold">Packing for trip {id}</h1>
    </Card>
  );
}

export default PackingChecklist;

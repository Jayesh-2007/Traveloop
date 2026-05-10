import { useParams } from 'react-router-dom';
import Card from '../components/shared/Card.jsx';

function TripNotes() {
  const { id } = useParams();

  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Trip Notes</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Notes for trip {id}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Collaborative notes and saved ideas will live here.
      </p>
    </Card>
  );
}

export default TripNotes;

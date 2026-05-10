import Card from '../components/shared/Card.jsx';

function UserProfile() {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Profile</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">User preferences</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Account settings and travel preferences will live here.
      </p>
    </Card>
  );
}

export default UserProfile;

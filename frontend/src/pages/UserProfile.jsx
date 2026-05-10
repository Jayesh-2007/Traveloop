import Card from '../components/shared/Card.jsx';

function UserProfile() {
  return (
    <Card>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">Profile</p>
      <h1 className="mt-2 text-2xl font-semibold">User preferences</h1>
    </Card>
  );
}

export default UserProfile;

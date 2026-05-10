import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './hooks/useAuth.js';
import AppLayout from './layouts/AppLayout.jsx';
import CreateTrip from './pages/CreateTrip.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ItineraryView from './pages/ItineraryView.jsx';
import Login from './pages/Login.jsx';
import MyTrips from './pages/MyTrips.jsx';
import PackingChecklist from './pages/PackingChecklist.jsx';
import PublicItinerary from './pages/PublicItinerary.jsx';
import Signup from './pages/Signup.jsx';
import TripNotes from './pages/TripNotes.jsx';
import UserProfile from './pages/UserProfile.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/share/:token" element={<PublicItinerary />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trips" element={<MyTrips />} />
              <Route path="/trips/new" element={<CreateTrip />} />
              <Route path="/trips/:id/view" element={<ItineraryView />} />
              <Route path="/trips/:id/checklist" element={<PackingChecklist />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/trips/:id/notes" element={<TripNotes />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

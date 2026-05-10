const pool = require('../config/db');
const { getTripForUser } = require('./stopController');

function mapActivity(row) {
  return {
    id: row.stop_activity_id,
    activity_id: row.activity_id,
    name: row.activity_name,
    category: row.category,
    description: row.description,
    address: row.address,
    estimated_cost: row.estimated_cost === null ? 0 : Number(row.estimated_cost),
    duration_minutes: row.duration_minutes,
    activity_order: row.activity_order,
    scheduled_date: row.scheduled_date,
    start_time: row.start_time
  };
}

async function getItineraryData(trip, connection = pool) {
  const [stops] = await connection.query(
    `SELECT
      s.id,
      s.trip_id,
      s.city_id,
      c.name AS city_name,
      c.country_code,
      c.country_name,
      c.timezone,
      c.latitude,
      c.longitude,
      s.stop_order,
      DATE_FORMAT(s.arrival_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(s.departure_date, '%Y-%m-%d') AS end_date
    FROM stops s
    INNER JOIN cities c ON c.id = s.city_id
    WHERE s.trip_id = ?
    ORDER BY s.stop_order ASC`,
    [trip.id]
  );

  const [activities] = await connection.query(
    `SELECT
      sa.id AS stop_activity_id,
      sa.stop_id,
      sa.activity_id,
      a.name AS activity_name,
      a.category,
      a.description,
      a.address,
      a.estimated_cost,
      a.duration_minutes,
      sa.activity_order,
      DATE_FORMAT(sa.scheduled_date, '%Y-%m-%d') AS scheduled_date,
      TIME_FORMAT(sa.start_time, '%H:%i:%s') AS start_time
    FROM stop_activities sa
    INNER JOIN activities a ON a.id = sa.activity_id
    INNER JOIN stops s ON s.id = sa.stop_id
    WHERE s.trip_id = ?
    ORDER BY s.stop_order ASC, sa.activity_order ASC`,
    [trip.id]
  );

  const activitiesByStop = new Map();
  let estimatedActivitiesCost = 0;
  let estimatedDurationMinutes = 0;

  for (const activity of activities) {
    const mappedActivity = mapActivity(activity);
    estimatedActivitiesCost += mappedActivity.estimated_cost;
    estimatedDurationMinutes += mappedActivity.duration_minutes || 0;

    if (!activitiesByStop.has(activity.stop_id)) {
      activitiesByStop.set(activity.stop_id, []);
    }

    activitiesByStop.get(activity.stop_id).push(mappedActivity);
  }

  const itineraryStops = stops.map((stop) => ({
    id: stop.id,
    trip_id: stop.trip_id,
    city_id: stop.city_id,
    city: {
      id: stop.city_id,
      name: stop.city_name,
      country_code: stop.country_code,
      country_name: stop.country_name,
      timezone: stop.timezone,
      latitude: stop.latitude === null ? null : Number(stop.latitude),
      longitude: stop.longitude === null ? null : Number(stop.longitude)
    },
    stop_order: stop.stop_order,
    start_date: stop.start_date,
    end_date: stop.end_date,
    activities: activitiesByStop.get(stop.id) || []
  }));

  return {
    trip,
    stops: itineraryStops,
    totals: {
      stop_count: itineraryStops.length,
      activity_count: activities.length,
      estimated_activities_cost: Number(estimatedActivitiesCost.toFixed(2)),
      estimated_duration_minutes: estimatedDurationMinutes
    },
    budget_summary: {
      estimated_activities_cost: Number(estimatedActivitiesCost.toFixed(2)),
      currency_code: 'USD'
    }
  };
}

async function getItinerary(req, res) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Itinerary fetched successfully',
      data: await getItineraryData(trip)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching itinerary'
    });
  }
}

module.exports = {
  getItinerary,
  getItineraryData
};

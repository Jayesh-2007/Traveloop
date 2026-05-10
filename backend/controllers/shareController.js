const pool = require('../config/db');
const { getItineraryData } = require('./itineraryController');
const generateShareToken = require('../utils/generateShareToken');

function safePublicTrip(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    start_date: row.start_date,
    end_date: row.end_date,
    is_public: Boolean(row.is_public)
  };
}

async function createUniqueShareToken(connection = pool) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = generateShareToken();
    const [existing] = await connection.query(
      'SELECT id FROM trips WHERE share_token = ? LIMIT 1',
      [token]
    );

    if (existing.length === 0) {
      return token;
    }
  }

  throw new Error('Could not generate unique share token');
}

async function getTripByToken(token, connection = pool) {
  const [trips] = await connection.query(
    `SELECT
      id,
      user_id,
      title AS name,
      description,
      DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
      is_public,
      share_token
    FROM trips
    WHERE share_token = ?
    LIMIT 1`,
    [token]
  );

  return trips[0] || null;
}

async function enableSharing(req, res) {
  try {
    const [trips] = await pool.query(
      'SELECT id, share_token FROM trips WHERE id = ? AND user_id = ? LIMIT 1',
      [req.params.id, req.user.id]
    );

    if (trips.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const shareToken = trips[0].share_token || await createUniqueShareToken();

    await pool.query(
      'UPDATE trips SET is_public = TRUE, share_token = ? WHERE id = ? AND user_id = ?',
      [shareToken, req.params.id, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Sharing enabled successfully',
      data: {
        share_token: shareToken,
        share_url: `${req.protocol}://${req.get('host')}/api/share/${shareToken}`
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while enabling sharing'
    });
  }
}

async function disableSharing(req, res) {
  try {
    const [result] = await pool.query(
      'UPDATE trips SET is_public = FALSE, share_token = NULL WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sharing disabled successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while disabling sharing'
    });
  }
}

async function getPublicItinerary(req, res) {
  try {
    const trip = await getTripByToken(req.params.token);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Invalid share token'
      });
    }

    if (!trip.is_public) {
      return res.status(403).json({
        success: false,
        message: 'This trip is private'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Public itinerary fetched successfully',
      data: await getItineraryData(safePublicTrip(trip))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching public itinerary'
    });
  }
}

async function copyPublicTrip(req, res) {
  const connection = await pool.getConnection();

  try {
    const sourceTrip = await getTripByToken(req.params.token, connection);

    if (!sourceTrip) {
      return res.status(404).json({
        success: false,
        message: 'Invalid share token'
      });
    }

    if (!sourceTrip.is_public) {
      return res.status(403).json({
        success: false,
        message: 'This trip is private'
      });
    }

    await connection.beginTransaction();

    const [tripResult] = await connection.query(
      `INSERT INTO trips
        (user_id, title, description, start_date, end_date, is_public, share_token)
      VALUES (?, ?, ?, ?, ?, FALSE, NULL)`,
      [
        req.user.id,
        `${sourceTrip.name} (Copy)`,
        sourceTrip.description,
        sourceTrip.start_date,
        sourceTrip.end_date
      ]
    );
    const newTripId = tripResult.insertId;

    const [sourceStops] = await connection.query(
      `SELECT
        id,
        city_id,
        stop_order,
        DATE_FORMAT(arrival_date, '%Y-%m-%d') AS arrival_date,
        DATE_FORMAT(departure_date, '%Y-%m-%d') AS departure_date
      FROM stops
      WHERE trip_id = ?
      ORDER BY stop_order ASC`,
      [sourceTrip.id]
    );

    const stopIdMap = new Map();

    for (const stop of sourceStops) {
      const [stopResult] = await connection.query(
        `INSERT INTO stops (trip_id, city_id, stop_order, arrival_date, departure_date)
        VALUES (?, ?, ?, ?, ?)`,
        [
          newTripId,
          stop.city_id,
          stop.stop_order,
          stop.arrival_date,
          stop.departure_date
        ]
      );

      stopIdMap.set(stop.id, stopResult.insertId);
    }

    const [sourceActivities] = await connection.query(
      `SELECT
        sa.stop_id,
        sa.activity_id,
        sa.activity_order,
        DATE_FORMAT(sa.scheduled_date, '%Y-%m-%d') AS scheduled_date,
        TIME_FORMAT(sa.start_time, '%H:%i:%s') AS start_time
      FROM stop_activities sa
      INNER JOIN stops s ON s.id = sa.stop_id
      WHERE s.trip_id = ?
      ORDER BY s.stop_order ASC, sa.activity_order ASC`,
      [sourceTrip.id]
    );

    for (const activity of sourceActivities) {
      await connection.query(
        `INSERT INTO stop_activities
          (stop_id, activity_id, activity_order, scheduled_date, start_time)
        VALUES (?, ?, ?, ?, ?)`,
        [
          stopIdMap.get(activity.stop_id),
          activity.activity_id,
          activity.activity_order,
          activity.scheduled_date,
          activity.start_time
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Trip copied successfully',
      data: {
        trip_id: newTripId
      }
    });
  } catch (error) {
    await connection.rollback();

    return res.status(500).json({
      success: false,
      message: 'Server error while copying trip'
    });
  } finally {
    connection.release();
  }
}

module.exports = {
  enableSharing,
  disableSharing,
  getPublicItinerary,
  copyPublicTrip
};

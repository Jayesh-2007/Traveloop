const pool = require('../config/db');
const { getItineraryData } = require('./itineraryController');

function toBooleanValue(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function mapTrip(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    description: row.description,
    start_date: row.start_date,
    end_date: row.end_date,
    is_public: Boolean(row.is_public),
    share_token: row.share_token,
    stop_count: Number(row.stop_count || 0),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function findTripByIdForUser(tripId, userId) {
  const [trips] = await pool.query(
    `SELECT
      t.id,
      t.user_id,
      t.title AS name,
      t.description,
      DATE_FORMAT(t.start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(t.end_date, '%Y-%m-%d') AS end_date,
      t.is_public,
      t.share_token,
      (
        SELECT COUNT(*)
        FROM stops s
        WHERE s.trip_id = t.id
      ) AS stop_count,
      t.created_at,
      t.updated_at
    FROM trips t
    WHERE t.id = ? AND t.user_id = ?
    LIMIT 1`,
    [tripId, userId]
  );

  return trips[0] || null;
}

async function createTrip(req, res) {
  try {
    const { name, description, start_date, end_date } = req.body;
    const isPublic = toBooleanValue(req.body.is_public);

    const [result] = await pool.query(
      `INSERT INTO trips
        (user_id, title, description, start_date, end_date, is_public, share_token)
      VALUES (?, ?, ?, ?, ?, ?, NULL)`,
      [
        req.user.id,
        name,
        description || null,
        start_date,
        end_date,
        isPublic
      ]
    );

    const trip = await findTripByIdForUser(result.insertId, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: {
        trip: mapTrip(trip)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while creating trip'
    });
  }
}

async function getTrips(req, res) {
  try {
    const [trips] = await pool.query(
      `SELECT
        t.id,
        t.user_id,
        t.title AS name,
        t.description,
        DATE_FORMAT(t.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(t.end_date, '%Y-%m-%d') AS end_date,
        t.is_public,
        t.share_token,
        (
          SELECT COUNT(*)
          FROM stops s
          WHERE s.trip_id = t.id
        ) AS stop_count,
        t.created_at,
        t.updated_at
      FROM trips t
      WHERE t.user_id = ?
      ORDER BY t.start_date ASC, t.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Trips fetched successfully',
      data: {
        trips: trips.map(mapTrip)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching trips'
    });
  }
}

async function getTripById(req, res) {
  try {
    const trip = await findTripByIdForUser(req.params.id, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip fetched successfully',
      data: {
        trip: mapTrip(trip)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching trip'
    });
  }
}

async function updateTrip(req, res) {
  try {
    const { name, description, start_date, end_date } = req.body;
    const isPublic = toBooleanValue(req.body.is_public);

    const [result] = await pool.query(
      `UPDATE trips
      SET title = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        is_public = ?
      WHERE id = ? AND user_id = ?`,
      [
        name,
        description || null,
        start_date,
        end_date,
        isPublic,
        req.params.id,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const trip = await findTripByIdForUser(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: {
        trip: mapTrip(trip)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating trip'
    });
  }
}

async function deleteTrip(req, res) {
  try {
    const [result] = await pool.query(
      'DELETE FROM trips WHERE id = ? AND user_id = ?',
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
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting trip'
    });
  }
}

async function exportTrip(req, res) {
  try {
    const trip = await findTripByIdForUser(req.params.id, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const itinerary = await getItineraryData({
      id: trip.id,
      name: trip.name,
      description: trip.description,
      start_date: trip.start_date,
      end_date: trip.end_date,
      is_public: trip.is_public
    });

    return res.status(200).json({
      success: true,
      message: 'Trip export fetched successfully',
      data: {
        export_version: '1.0',
        generated_at: new Date().toISOString(),
        itinerary
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while exporting trip'
    });
  }
}

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  exportTrip
};

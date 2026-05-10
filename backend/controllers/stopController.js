const pool = require('../config/db');

function mapStop(row) {
  return {
    id: row.id,
    trip_id: row.trip_id,
    city_id: row.city_id,
    city_name: row.city_name,
    country_code: row.country_code,
    country_name: row.country_name,
    stop_order: row.stop_order,
    start_date: row.start_date,
    end_date: row.end_date,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function mapStopActivity(row) {
  return {
    id: row.stop_activity_id,
    stop_id: row.stop_id,
    activity_id: row.activity_id,
    name: row.name,
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

async function getTripForUser(tripId, userId, connection = pool) {
  const [trips] = await connection.query(
    `SELECT
      id,
      user_id,
      title AS name,
      DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date
    FROM trips
    WHERE id = ? AND user_id = ?
    LIMIT 1`,
    [tripId, userId]
  );

  return trips[0] || null;
}

async function getStopForTrip(tripId, stopId, connection = pool) {
  const [stops] = await connection.query(
    `SELECT
      s.id,
      s.trip_id,
      s.city_id,
      s.stop_order,
      DATE_FORMAT(s.arrival_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(s.departure_date, '%Y-%m-%d') AS end_date
    FROM stops s
    WHERE s.id = ? AND s.trip_id = ?
    LIMIT 1`,
    [stopId, tripId]
  );

  return stops[0] || null;
}

async function cityExists(cityId, connection = pool) {
  const [cities] = await connection.query(
    'SELECT id FROM cities WHERE id = ? AND is_active = TRUE LIMIT 1',
    [cityId]
  );

  return cities.length > 0;
}

async function hasOverlappingStop(tripId, startDate, endDate, ignoredStopId = null, connection = pool) {
  const values = [tripId, endDate, startDate];
  let ignoredStopSql = '';

  if (ignoredStopId) {
    ignoredStopSql = 'AND id <> ?';
    values.push(ignoredStopId);
  }

  const [stops] = await connection.query(
    `SELECT id
    FROM stops
    WHERE trip_id = ?
      ${ignoredStopSql}
      AND arrival_date <= ?
      AND departure_date >= ?
    LIMIT 1`,
    values
  );

  return stops.length > 0;
}

async function getNextActivityOrder(stopId, connection = pool) {
  const [rows] = await connection.query(
    'SELECT COALESCE(MAX(activity_order), 0) + 1 AS next_order FROM stop_activities WHERE stop_id = ?',
    [stopId]
  );

  return rows[0].next_order;
}

async function fetchStopsForTrip(tripId, connection = pool) {
  const [stops] = await connection.query(
    `SELECT
      s.id,
      s.trip_id,
      s.city_id,
      c.name AS city_name,
      c.country_code,
      c.country_name,
      s.stop_order,
      DATE_FORMAT(s.arrival_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(s.departure_date, '%Y-%m-%d') AS end_date,
      s.created_at,
      s.updated_at
    FROM stops s
    INNER JOIN cities c ON c.id = s.city_id
    WHERE s.trip_id = ?
    ORDER BY s.stop_order ASC`,
    [tripId]
  );

  return stops.map(mapStop);
}

async function addStop(req, res) {
  const connection = await pool.getConnection();

  try {
    const trip = await getTripForUser(req.params.id, req.user.id, connection);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const { city_id, start_date, end_date, stop_order } = req.body;

    if (!(await cityExists(city_id, connection))) {
      return res.status(400).json({
        success: false,
        message: 'City not found'
      });
    }

    if (await hasOverlappingStop(req.params.id, start_date, end_date, null, connection)) {
      return res.status(400).json({
        success: false,
        message: 'Stop dates overlap an existing stop'
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE stops
      SET stop_order = stop_order + 1
      WHERE trip_id = ? AND stop_order >= ?
      ORDER BY stop_order DESC`,
      [req.params.id, stop_order]
    );

    const [result] = await connection.query(
      `INSERT INTO stops (trip_id, city_id, stop_order, arrival_date, departure_date)
      VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, city_id, stop_order, start_date, end_date]
    );

    await connection.commit();

    const stops = await fetchStopsForTrip(req.params.id);
    const stop = stops.find((item) => item.id === result.insertId);

    return res.status(201).json({
      success: true,
      message: 'Stop added successfully',
      data: {
        stop,
        stops
      }
    });
  } catch (error) {
    await connection.rollback();

    return res.status(500).json({
      success: false,
      message: 'Server error while adding stop'
    });
  } finally {
    connection.release();
  }
}

async function getStops(req, res) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const stops = await fetchStopsForTrip(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Stops fetched successfully',
      data: {
        stops
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching stops'
    });
  }
}

async function updateStop(req, res) {
  const connection = await pool.getConnection();

  try {
    const trip = await getTripForUser(req.params.id, req.user.id, connection);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const stop = await getStopForTrip(req.params.id, req.params.stopId, connection);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    const { city_id, start_date, end_date, stop_order } = req.body;

    if (!(await cityExists(city_id, connection))) {
      return res.status(400).json({
        success: false,
        message: 'City not found'
      });
    }

    if (await hasOverlappingStop(req.params.id, start_date, end_date, req.params.stopId, connection)) {
      return res.status(400).json({
        success: false,
        message: 'Stop dates overlap an existing stop'
      });
    }

    if (Number(city_id) !== Number(stop.city_id)) {
      const [invalidActivities] = await connection.query(
        `SELECT sa.id
        FROM stop_activities sa
        INNER JOIN activities a ON a.id = sa.activity_id
        WHERE sa.stop_id = ? AND a.city_id <> ?
        LIMIT 1`,
        [req.params.stopId, city_id]
      );

      if (invalidActivities.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change stop city while assigned activities belong to another city'
        });
      }
    }

    await connection.beginTransaction();

    if (Number(stop_order) !== Number(stop.stop_order)) {
      await connection.query(
        'UPDATE stops SET stop_order = ? WHERE id = ? AND trip_id = ?',
        [100000 + Number(stop.stop_order), req.params.stopId, req.params.id]
      );

      if (Number(stop_order) < Number(stop.stop_order)) {
        await connection.query(
          `UPDATE stops
          SET stop_order = stop_order + 1
          WHERE trip_id = ? AND stop_order >= ? AND stop_order < ?
          ORDER BY stop_order DESC`,
          [req.params.id, stop_order, stop.stop_order]
        );
      } else {
        await connection.query(
          `UPDATE stops
          SET stop_order = stop_order - 1
          WHERE trip_id = ? AND stop_order > ? AND stop_order <= ?
          ORDER BY stop_order ASC`,
          [req.params.id, stop.stop_order, stop_order]
        );
      }
    }

    await connection.query(
      `UPDATE stops
      SET city_id = ?,
        stop_order = ?,
        arrival_date = ?,
        departure_date = ?
      WHERE id = ? AND trip_id = ?`,
      [city_id, stop_order, start_date, end_date, req.params.stopId, req.params.id]
    );

    await connection.commit();

    const stops = await fetchStopsForTrip(req.params.id);
    const updatedStop = stops.find((item) => item.id === Number(req.params.stopId));

    return res.status(200).json({
      success: true,
      message: 'Stop updated successfully',
      data: {
        stop: updatedStop,
        stops
      }
    });
  } catch (error) {
    await connection.rollback();

    return res.status(500).json({
      success: false,
      message: 'Server error while updating stop'
    });
  } finally {
    connection.release();
  }
}

async function deleteStop(req, res) {
  const connection = await pool.getConnection();

  try {
    const trip = await getTripForUser(req.params.id, req.user.id, connection);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const stop = await getStopForTrip(req.params.id, req.params.stopId, connection);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    await connection.beginTransaction();

    await connection.query(
      'DELETE FROM stops WHERE id = ? AND trip_id = ?',
      [req.params.stopId, req.params.id]
    );

    await connection.query(
      `UPDATE stops
      SET stop_order = stop_order - 1
      WHERE trip_id = ? AND stop_order > ?
      ORDER BY stop_order ASC`,
      [req.params.id, stop.stop_order]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Stop deleted successfully'
    });
  } catch (error) {
    await connection.rollback();

    return res.status(500).json({
      success: false,
      message: 'Server error while deleting stop'
    });
  } finally {
    connection.release();
  }
}

async function reorderStops(req, res) {
  const connection = await pool.getConnection();

  try {
    const trip = await getTripForUser(req.params.id, req.user.id, connection);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const requestedStopIds = req.body.stop_ids.map(Number);

    const [currentStops] = await connection.query(
      'SELECT id FROM stops WHERE trip_id = ? ORDER BY stop_order ASC',
      [req.params.id]
    );
    const currentStopIds = currentStops.map((stop) => stop.id);
    const requestedSet = new Set(requestedStopIds);

    if (
      requestedStopIds.length !== currentStopIds.length ||
      requestedSet.size !== currentStopIds.length ||
      currentStopIds.some((id) => !requestedSet.has(id))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Stop ids must include every stop for the trip exactly once'
      });
    }

    await connection.beginTransaction();

    for (let index = 0; index < requestedStopIds.length; index += 1) {
      await connection.query(
        'UPDATE stops SET stop_order = ? WHERE id = ? AND trip_id = ?',
        [100000 + index, requestedStopIds[index], req.params.id]
      );
    }

    for (let index = 0; index < requestedStopIds.length; index += 1) {
      await connection.query(
        'UPDATE stops SET stop_order = ? WHERE id = ? AND trip_id = ?',
        [index + 1, requestedStopIds[index], req.params.id]
      );
    }

    await connection.commit();

    const stops = await fetchStopsForTrip(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Stops reordered successfully',
      data: {
        stops
      }
    });
  } catch (error) {
    await connection.rollback();

    return res.status(500).json({
      success: false,
      message: 'Server error while reordering stops'
    });
  } finally {
    connection.release();
  }
}

async function assignActivityToStop(req, res) {
  const connection = await pool.getConnection();

  try {
    const trip = await getTripForUser(req.params.id, req.user.id, connection);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const stop = await getStopForTrip(req.params.id, req.params.stopId, connection);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    const [activities] = await connection.query(
      `SELECT id, city_id
      FROM activities
      WHERE id = ?
      LIMIT 1`,
      [req.body.activity_id]
    );

    if (activities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Activity not found'
      });
    }

    if (Number(activities[0].city_id) !== Number(stop.city_id)) {
      return res.status(400).json({
        success: false,
        message: 'Activity must belong to the same city as the stop'
      });
    }

    const [existingAssignments] = await connection.query(
      `SELECT id
      FROM stop_activities
      WHERE stop_id = ? AND activity_id = ?
      LIMIT 1`,
      [req.params.stopId, req.body.activity_id]
    );

    if (existingAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Activity is already assigned to this stop'
      });
    }

    const activityOrder = req.body.activity_order || await getNextActivityOrder(req.params.stopId, connection);

    await connection.beginTransaction();

    await connection.query(
      `UPDATE stop_activities
      SET activity_order = activity_order + 1
      WHERE stop_id = ? AND activity_order >= ?
      ORDER BY activity_order DESC`,
      [req.params.stopId, activityOrder]
    );

    const [result] = await connection.query(
      `INSERT INTO stop_activities
        (stop_id, activity_id, activity_order, scheduled_date, start_time)
      VALUES (?, ?, ?, ?, ?)`,
      [
        req.params.stopId,
        req.body.activity_id,
        activityOrder,
        req.body.scheduled_date || null,
        req.body.start_time || null
      ]
    );

    await connection.commit();

    const [assignedActivities] = await pool.query(
      `SELECT
        sa.id AS stop_activity_id,
        sa.stop_id,
        sa.activity_id,
        a.name,
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
      WHERE sa.id = ?
      LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Activity assigned successfully',
      data: {
        activity: mapStopActivity(assignedActivities[0])
      }
    });
  } catch (error) {
    await connection.rollback();

    return res.status(500).json({
      success: false,
      message: 'Server error while assigning activity'
    });
  } finally {
    connection.release();
  }
}

module.exports = {
  addStop,
  getStops,
  updateStop,
  deleteStop,
  reorderStops,
  assignActivityToStop,
  fetchStopsForTrip,
  getTripForUser
};

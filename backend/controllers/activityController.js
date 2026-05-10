const pool = require('../config/db');
const { parseLimit } = require('./cityController');

function mapActivity(row) {
  return {
    id: row.id,
    city_id: row.city_id,
    city_name: row.city_name,
    country_name: row.country_name,
    name: row.name,
    category: row.category,
    description: row.description,
    address: row.address,
    estimated_cost: row.estimated_cost === null ? 0 : Number(row.estimated_cost),
    duration_minutes: row.duration_minutes,
    duration_hours: row.duration_minutes === null
      ? null
      : Number((row.duration_minutes / 60).toFixed(2))
  };
}

async function searchActivities(filters) {
  const { search, category, city_id, limit: rawLimit } = filters;
  const limit = parseLimit(rawLimit);
  const where = ['c.is_active = TRUE'];
  const values = [];

  if (search) {
    where.push('(LOWER(a.name) LIKE ? OR LOWER(a.description) LIKE ? OR LOWER(c.name) LIKE ?)');
    values.push(
      `%${search.toLowerCase()}%`,
      `%${search.toLowerCase()}%`,
      `%${search.toLowerCase()}%`
    );
  }

  if (category) {
    where.push('LOWER(a.category) = ?');
    values.push(category.toLowerCase());
  }

  if (city_id) {
    where.push('a.city_id = ?');
    values.push(city_id);
  }

  const [activities] = await pool.query(
    `SELECT
      a.id,
      a.city_id,
      c.name AS city_name,
      c.country_name,
      a.name,
      a.category,
      a.description,
      a.address,
      a.estimated_cost,
      a.duration_minutes
    FROM activities a
    INNER JOIN cities c ON c.id = a.city_id
    WHERE ${where.join(' AND ')}
    ORDER BY a.estimated_cost ASC, a.name ASC
    LIMIT ?`,
    [...values, limit]
  );

  return activities.map(mapActivity);
}

async function getCityActivities(req, res) {
  try {
    const [cities] = await pool.query(
      'SELECT id FROM cities WHERE id = ? AND is_active = TRUE LIMIT 1',
      [req.params.id]
    );

    if (cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    const activities = await searchActivities({
      ...req.query,
      city_id: req.params.id
    });

    return res.status(200).json({
      success: true,
      message: 'City activities fetched successfully',
      data: {
        activities
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching city activities'
    });
  }
}

async function searchActivitiesGlobally(req, res) {
  try {
    const activities = await searchActivities(req.query);

    return res.status(200).json({
      success: true,
      message: 'Activities fetched successfully',
      data: {
        activities
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching activities'
    });
  }
}

module.exports = {
  getCityActivities,
  searchActivitiesGlobally
};

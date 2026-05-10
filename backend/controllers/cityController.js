const pool = require('../config/db');

const REGION_SQL = `CASE
  WHEN c.country_code IN ('FR', 'NL', 'DE', 'CZ', 'AT', 'IT', 'ES', 'PT') THEN 'Europe'
  WHEN c.country_code = 'JP' THEN 'East Asia'
  WHEN c.country_code = 'IN' THEN 'South Asia'
  ELSE 'Other'
END`;

function parseLimit(value, defaultLimit = 20, maxLimit = 50) {
  const limit = Number(value);

  if (!Number.isInteger(limit) || limit <= 0) {
    return defaultLimit;
  }

  return Math.min(limit, maxLimit);
}

function mapCity(row) {
  return {
    id: row.id,
    name: row.name,
    country_code: row.country_code,
    country_name: row.country_name,
    region: row.region,
    timezone: row.timezone,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    is_active: Boolean(row.is_active),
    activity_count: Number(row.activity_count || 0)
  };
}

async function getCities(req, res) {
  try {
    const { search, country, region, sort } = req.query;
    const limit = parseLimit(req.query.limit);
    const where = ['c.is_active = TRUE'];
    const values = [];

    if (search) {
      where.push('(LOWER(c.name) LIKE ? OR LOWER(c.country_name) LIKE ?)');
      values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    if (country) {
      where.push('(LOWER(c.country_name) = ? OR LOWER(c.country_code) = ?)');
      values.push(country.toLowerCase(), country.toLowerCase());
    }

    if (region) {
      where.push(`LOWER(${REGION_SQL}) = ?`);
      values.push(region.toLowerCase());
    }

    const sortOptions = {
      name: 'c.name ASC',
      country: 'c.country_name ASC, c.name ASC',
      activities: 'activity_count DESC, c.name ASC'
    };
    const orderBy = sortOptions[sort] || 'c.name ASC';

    const [cities] = await pool.query(
      `SELECT
        c.id,
        c.name,
        c.country_code,
        c.country_name,
        ${REGION_SQL} AS region,
        c.timezone,
        c.latitude,
        c.longitude,
        c.is_active,
        COUNT(a.id) AS activity_count
      FROM cities c
      LEFT JOIN activities a ON a.city_id = c.id
      WHERE ${where.join(' AND ')}
      GROUP BY
        c.id,
        c.name,
        c.country_code,
        c.country_name,
        c.timezone,
        c.latitude,
        c.longitude,
        c.is_active
      ORDER BY ${orderBy}
      LIMIT ?`,
      [...values, limit]
    );

    return res.status(200).json({
      success: true,
      message: 'Cities fetched successfully',
      data: {
        cities: cities.map(mapCity)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cities'
    });
  }
}

async function getCityById(req, res) {
  try {
    const [cities] = await pool.query(
      `SELECT
        c.id,
        c.name,
        c.country_code,
        c.country_name,
        ${REGION_SQL} AS region,
        c.timezone,
        c.latitude,
        c.longitude,
        c.is_active,
        COUNT(a.id) AS activity_count
      FROM cities c
      LEFT JOIN activities a ON a.city_id = c.id
      WHERE c.id = ? AND c.is_active = TRUE
      GROUP BY
        c.id,
        c.name,
        c.country_code,
        c.country_name,
        c.timezone,
        c.latitude,
        c.longitude,
        c.is_active
      LIMIT 1`,
      [req.params.id]
    );

    if (cities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'City fetched successfully',
      data: {
        city: mapCity(cities[0])
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching city'
    });
  }
}

module.exports = {
  getCities,
  getCityById,
  parseLimit
};

const pool = require('../config/db');

const COST_RATES = {
  Europe: {
    stayPerNight: 90,
    mealsPerDay: 45,
    transfer: 80
  },
  'East Asia': {
    stayPerNight: 85,
    mealsPerDay: 40,
    transfer: 70
  },
  'South Asia': {
    stayPerNight: 45,
    mealsPerDay: 22,
    transfer: 45
  },
  Other: {
    stayPerNight: 70,
    mealsPerDay: 35,
    transfer: 60
  }
};

function getRegion(countryCode) {
  if (['FR', 'NL', 'DE', 'CZ', 'AT', 'IT', 'ES', 'PT'].includes(countryCode)) {
    return 'Europe';
  }

  if (countryCode === 'JP') {
    return 'East Asia';
  }

  if (countryCode === 'IN') {
    return 'South Asia';
  }

  return 'Other';
}

function toMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function getDaysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const diffMs = end.getTime() - start.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return 1;
  }

  return Math.floor(diffMs / 86400000) + 1;
}

function getNightsBetween(startDate, endDate) {
  return Math.max(getDaysBetween(startDate, endDate) - 1, 0);
}

function addDays(date, days) {
  const nextDate = new Date(`${date}T00:00:00.000Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function addDailyCost(dailyMap, date, category, amount) {
  const existing = dailyMap.get(date) || {
    date,
    transport: 0,
    stay: 0,
    meals: 0,
    activities: 0,
    total: 0
  };

  existing[category] = toMoney(existing[category] + amount);
  existing.total = toMoney(
    existing.transport + existing.stay + existing.meals + existing.activities
  );
  dailyMap.set(date, existing);
}

function addToCategory(categories, category, amount) {
  categories[category] = toMoney((categories[category] || 0) + amount);
}

function buildBudgetResponse(trip, stops, activities, budgetCap) {
  const activityTotalsByStop = new Map();
  const dailyMap = new Map();
  const categoryTotals = {};
  let activitiesTotal = 0;

  for (const activity of activities) {
    const cost = Number(activity.estimated_cost || 0);
    activitiesTotal += cost;
    addToCategory(categoryTotals, activity.category || 'Other', cost);

    activityTotalsByStop.set(
      activity.stop_id,
      toMoney((activityTotalsByStop.get(activity.stop_id) || 0) + cost)
    );

    const day = activity.scheduled_date || activity.arrival_date || trip.start_date;
    addDailyCost(dailyMap, day, 'activities', cost);
  }

  let transportTotal = 0;
  let stayTotal = 0;
  let mealsTotal = 0;

  const stopBreakdown = stops.map((stop, index) => {
    const region = getRegion(stop.country_code);
    const rates = COST_RATES[region];
    const days = getDaysBetween(stop.arrival_date, stop.departure_date);
    const nights = getNightsBetween(stop.arrival_date, stop.departure_date);
    const stay = toMoney(nights * rates.stayPerNight);
    const meals = toMoney(days * rates.mealsPerDay);
    const transport = index === 0 ? 0 : rates.transfer;
    const activityTotal = activityTotalsByStop.get(stop.id) || 0;
    const total = toMoney(stay + meals + transport + activityTotal);

    stayTotal += stay;
    mealsTotal += meals;
    transportTotal += transport;

    addDailyCost(dailyMap, stop.arrival_date, 'transport', transport);

    for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
      addDailyCost(
        dailyMap,
        addDays(stop.arrival_date, dayIndex),
        'meals',
        rates.mealsPerDay
      );
    }

    for (let nightIndex = 0; nightIndex < nights; nightIndex += 1) {
      addDailyCost(
        dailyMap,
        addDays(stop.arrival_date, nightIndex),
        'stay',
        rates.stayPerNight
      );
    }

    return {
      stop_id: stop.id,
      city_id: stop.city_id,
      city_name: stop.city_name,
      country_name: stop.country_name,
      region,
      arrival_date: stop.arrival_date,
      departure_date: stop.departure_date,
      days,
      estimated: {
        transport,
        stay,
        meals,
        activities: activityTotal,
        total
      }
    };
  });

  addToCategory(categoryTotals, 'Transport', transportTotal);
  addToCategory(categoryTotals, 'Stay', stayTotal);
  addToCategory(categoryTotals, 'Meals', mealsTotal);

  const dailyBreakdown = Array.from(dailyMap.values())
    .map((day) => ({
      ...day,
      total: toMoney(day.transport + day.stay + day.meals + day.activities)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalEstimatedCost = toMoney(
    transportTotal + stayTotal + mealsTotal + activitiesTotal
  );
  const tripDays = getDaysBetween(trip.start_date, trip.end_date);
  const averageDailySpend = toMoney(totalEstimatedCost / tripDays);
  const highestCostDay = dailyBreakdown.reduce((highest, day) => {
    if (!highest || day.total > highest.total) {
      return day;
    }

    return highest;
  }, null);
  const capAmount = budgetCap ? Number(budgetCap.amount) : null;
  const remainingBudget = capAmount === null ? null : toMoney(capAmount - totalEstimatedCost);
  const percentageUsed = capAmount === null || capAmount === 0
    ? null
    : toMoney((totalEstimatedCost / capAmount) * 100);
  const isOverBudget = capAmount === null ? false : totalEstimatedCost > capAmount;

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date,
      end_date: trip.end_date,
      days: tripDays
    },
    totals: {
      total_estimated_cost: totalEstimatedCost,
      transport_total: toMoney(transportTotal),
      stay_total: toMoney(stayTotal),
      activities_total: toMoney(activitiesTotal),
      meals_total: toMoney(mealsTotal),
      average_daily_spend: averageDailySpend,
      currency_code: budgetCap ? budgetCap.currency_code : 'USD'
    },
    category_totals: categoryTotals,
    stop_breakdown: stopBreakdown,
    daily_breakdown: dailyBreakdown,
    highest_cost_day: highestCostDay,
    budget_cap: budgetCap
      ? {
          amount: capAmount,
          currency_code: budgetCap.currency_code
        }
      : null,
    budget_status: {
      remaining_budget: remainingBudget,
      is_over_budget: isOverBudget,
      percentage_used: percentageUsed
    },
    warnings: isOverBudget ? ['Trip estimate is over the saved budget cap'] : []
  };
}

async function getTripForUser(tripId, userId) {
  const [trips] = await pool.query(
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

async function getBudgetInputs(tripId, userId) {
  const trip = await getTripForUser(tripId, userId);

  if (!trip) {
    return null;
  }

  const [stops] = await pool.query(
    `SELECT
      s.id,
      s.city_id,
      c.name AS city_name,
      c.country_code,
      c.country_name,
      DATE_FORMAT(s.arrival_date, '%Y-%m-%d') AS arrival_date,
      DATE_FORMAT(s.departure_date, '%Y-%m-%d') AS departure_date,
      s.stop_order
    FROM stops s
    INNER JOIN cities c ON c.id = s.city_id
    WHERE s.trip_id = ?
    ORDER BY s.stop_order ASC`,
    [tripId]
  );

  const [activities] = await pool.query(
    `SELECT
      sa.stop_id,
      DATE_FORMAT(sa.scheduled_date, '%Y-%m-%d') AS scheduled_date,
      a.id AS activity_id,
      a.name,
      a.category,
      a.estimated_cost,
      DATE_FORMAT(s.arrival_date, '%Y-%m-%d') AS arrival_date
    FROM stop_activities sa
    INNER JOIN stops s ON s.id = sa.stop_id
    INNER JOIN activities a ON a.id = sa.activity_id
    WHERE s.trip_id = ?
    ORDER BY COALESCE(sa.scheduled_date, s.arrival_date), sa.activity_order ASC`,
    [tripId]
  );

  const [budgetCaps] = await pool.query(
    'SELECT amount, currency_code FROM budget_caps WHERE trip_id = ? LIMIT 1',
    [tripId]
  );

  return {
    trip,
    stops,
    activities,
    budgetCap: budgetCaps[0] || null
  };
}

async function getTripBudget(req, res) {
  try {
    const inputs = await getBudgetInputs(req.params.id, req.user.id);

    if (!inputs) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip budget fetched successfully',
      data: buildBudgetResponse(
        inputs.trip,
        inputs.stops,
        inputs.activities,
        inputs.budgetCap
      )
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while computing trip budget'
    });
  }
}

async function setBudgetCap(req, res) {
  try {
    const trip = await getTripForUser(req.params.id, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const currencyCode = (req.body.currency_code || 'USD').toUpperCase();

    await pool.query(
      `INSERT INTO budget_caps (trip_id, amount, currency_code)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        amount = VALUES(amount),
        currency_code = VALUES(currency_code)`,
      [req.params.id, req.body.amount, currencyCode]
    );

    const inputs = await getBudgetInputs(req.params.id, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Budget cap saved successfully',
      data: {
        budget: buildBudgetResponse(
          inputs.trip,
          inputs.stops,
          inputs.activities,
          inputs.budgetCap
        ).budget_status,
        budget_cap: {
          amount: Number(req.body.amount),
          currency_code: currencyCode
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while saving budget cap'
    });
  }
}

async function getBudgetStatus(req, res) {
  try {
    const inputs = await getBudgetInputs(req.params.id, req.user.id);

    if (!inputs) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const budget = buildBudgetResponse(
      inputs.trip,
      inputs.stops,
      inputs.activities,
      inputs.budgetCap
    );

    return res.status(200).json({
      success: true,
      message: 'Budget status fetched successfully',
      data: {
        budget_cap: budget.budget_cap,
        total_estimated_cost: budget.totals.total_estimated_cost,
        remaining_budget: budget.budget_status.remaining_budget,
        is_over_budget: budget.budget_status.is_over_budget,
        percentage_used: budget.budget_status.percentage_used
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching budget status'
    });
  }
}

module.exports = {
  getTripBudget,
  setBudgetCap,
  getBudgetStatus
};

CREATE DATABASE IF NOT EXISTS traveloop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE traveloop;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  country_code CHAR(2) NOT NULL,
  country_name VARCHAR(120) NOT NULL,
  timezone VARCHAR(80) NOT NULL,
  latitude DECIMAL(9,6) NULL,
  longitude DECIMAL(9,6) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_cities_name_country UNIQUE (name, country_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trips (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  share_token VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_trips_user_id (user_id),
  CONSTRAINT uq_trips_share_token UNIQUE (share_token),
  CONSTRAINT fk_trips_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_trips_dates
    CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stops (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT UNSIGNED NOT NULL,
  city_id BIGINT UNSIGNED NOT NULL,
  stop_order INT UNSIGNED NOT NULL,
  arrival_date DATE NULL,
  departure_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_stops_city_id (city_id),
  CONSTRAINT uq_stops_trip_order UNIQUE (trip_id, stop_order),
  CONSTRAINT uq_stops_id_trip UNIQUE (id, trip_id),
  CONSTRAINT fk_stops_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_stops_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_stops_dates
    CHECK (arrival_date IS NULL OR departure_date IS NULL OR departure_date >= arrival_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  city_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NULL,
  description TEXT NULL,
  address VARCHAR(255) NULL,
  estimated_cost DECIMAL(10,2) NULL,
  duration_minutes INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_activities_city_id (city_id),
  CONSTRAINT uq_activities_city_name UNIQUE (city_id, name),
  CONSTRAINT fk_activities_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_activities_estimated_cost
    CHECK (estimated_cost IS NULL OR estimated_cost >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stop_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stop_id BIGINT UNSIGNED NOT NULL,
  activity_id BIGINT UNSIGNED NOT NULL,
  activity_order INT UNSIGNED NOT NULL,
  scheduled_date DATE NULL,
  start_time TIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  KEY idx_stop_activities_activity_id (activity_id),
  CONSTRAINT uq_stop_activities_stop_order UNIQUE (stop_id, activity_order),
  CONSTRAINT uq_stop_activities_stop_activity UNIQUE (stop_id, activity_id),
  CONSTRAINT fk_stop_activities_stop
    FOREIGN KEY (stop_id) REFERENCES stops(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_stop_activities_activity
    FOREIGN KEY (activity_id) REFERENCES activities(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS packing_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT UNSIGNED NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  is_packed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_packing_items_trip_id (trip_id),
  CONSTRAINT uq_packing_items_trip_item UNIQUE (trip_id, item_name),
  CONSTRAINT fk_packing_items_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_packing_items_quantity
    CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT UNSIGNED NOT NULL,
  stop_id BIGINT UNSIGNED NULL,
  title VARCHAR(150) NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_notes_trip_id (trip_id),
  KEY idx_notes_stop_id (stop_id),
  CONSTRAINT fk_notes_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_notes_stop_trip
    FOREIGN KEY (stop_id, trip_id) REFERENCES stops(id, trip_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS budget_caps (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency_code CHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_budget_caps_trip UNIQUE (trip_id),
  CONSTRAINT fk_budget_caps_trip
    FOREIGN KEY (trip_id) REFERENCES trips(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_budget_caps_amount
    CHECK (amount >= 0)
) ENGINE=InnoDB;

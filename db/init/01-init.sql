CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100) NOT NULL,
  api_username VARCHAR(100),
  api_password VARCHAR(100),
  api_canteen_id VARCHAR(100),
  session_ids TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{
    "salty": 0,
    "sweet": 0,
    "vegetables": 0,
    "meat": 0,
    "mushrooms": 0,
    "healthy": 0,
    "spicy": 0,
    "pasta": 0,
    "rice": 0,
    "fish": 0,
    "eggs": 0
  }',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

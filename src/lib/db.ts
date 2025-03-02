const { Pool } = require('pg');

const pool = new Pool({
  user: 'user',
  host: 'postgres',
  database: 'jidelna_ai',
  password: 'password',
  port: 5432,
});


export const query = (text: string, params?: any) => pool.query(text, params);


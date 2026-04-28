const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://app_1_db_user:QGPlCfp1DOmVuUpa76Be1fcxMuqLFfDg@dpg-d7o9d1pkh4rs73bla5rg-a.singapore-postgres.render.com/app_1_db',
  ssl: {
    rejectUnauthorized: false
  }
});

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        union_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        display_name VARCHAR(255),
        email VARCHAR(320),
        avatar TEXT,
        role VARCHAR(50) DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_sign_in_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('users table created');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS publications (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        pmid VARCHAR(20) NOT NULL,
        title TEXT NOT NULL,
        authors TEXT NOT NULL,
        journal VARCHAR(500) NOT NULL,
        year VARCHAR(10) NOT NULL,
        volume VARCHAR(50),
        issue VARCHAR(50),
        pages VARCHAR(100),
        doi VARCHAR(300),
        nlm_citation TEXT,
        impact_factor DECIMAL(6,3),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('publications table created');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS journal_impact_factors (
        id SERIAL PRIMARY KEY,
        journal_name VARCHAR(500) NOT NULL UNIQUE,
        issn VARCHAR(20),
        impact_factor DECIMAL(6,3),
        year VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('journal_impact_factors table created');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
};

createTables();

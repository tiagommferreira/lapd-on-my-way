var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123123@localhost:5432/postgres';

pg.connect(connectionString, function(err, client, done) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }

  client.query('CREATE TABLE IF NOT EXISTS users(id serial PRIMARY KEY, data xml not null)');
  done();
	
	client.query('CREATE TABLE IF NOT EXISTS meetings(meeting_id serial NOT NULL PRIMARY KEY, meeting_date TIMESTAMP, location TEXT)');
	done();
	
	client.query('CREATE TABLE IF NOT EXISTS meeting_users(meeting_id serial REFERENCES meetings(meeting_id), fb_id BIGINT, PRIMARY KEY(meeting_id, fb_id))');
	done();
});

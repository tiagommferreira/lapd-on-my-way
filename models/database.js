var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123123@localhost:5432/postgres';

pg.connect(connectionString, function(err, client, done) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }

  client.query('CREATE TABLE users(id serial PRIMARY KEY, data xml not null)');
  done();

  client.query("INSERT INTO users (data) VALUES ('<user><fb_id>123</fb_id><gender>Male</gender><first_name>Robert</first_name><last_name>Richards</last_name><position><latitude>41.178726</latitude><longitude>-8.598801</longitude></position></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });

  client.query("INSERT INTO users (data) VALUES ('<user><fb_id>123</fb_id><gender>Female</gender><first_name>Louise</first_name><last_name>Moore</last_name><position><latitude>41.177253</latitude><longitude>-8.596839</longitude></position></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });

  client.query("INSERT INTO users (data) VALUES ('<user><fb_id>123</fb_id><gender>Female</gender><first_name>Brenda</first_name><last_name>Robinson</last_name><position><latitude>41.182466</latitude><longitude>-8.598667</longitude></position></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });
	/*
	client.query('CREATE TABLE meetings(meeting_id serial NOT NULL PRIMARY KEY, meeting_date TIMESTAMP, location TEXT)');
	done();
	
	client.query("INSERT INTO meetings(meeting_date, location) VALUES (current_timestamp, 'TESTE')", function(err, result)
	{
		done();
		if (err)
			return console.error(err);
	});
	
	client.query('CREATE TABLE meeting_users(meeting_id serial REFERENCES meetings(meeting_id), fb_id serial, PRIMARY KEY(meeting_id, fb_id)');
	done();*/
});

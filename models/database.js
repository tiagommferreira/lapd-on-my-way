var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123123@localhost:5432/postgres';

pg.connect(connectionString, function(err, client, done) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }

  client.query('CREATE TABLE users(id serial PRIMARY KEY, data xml not null)')
  done();

  client.query("INSERT INTO users (data) VALUES ('<user><id>1</id><gender>Male</gender><first_name>Robert</first_name><last_name>Richards</last_name><position><latitude>41.178726</latitude><longitude>-8.598801</longitude></position></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });

  client.query("INSERT INTO users (data) VALUES ('<user><id>2</id><gender>Female</gender><first_name>Louise</first_name><last_name>Moore</last_name><position><latitude>41.177253</latitude><longitude>-8.596839</longitude></position></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });

  client.query("INSERT INTO users (data) VALUES ('<user><id>3</id><gender>Female</gender><first_name>Brenda</first_name><last_name>Robinson</last_name><position><latitude>41.182466</latitude><longitude>-8.598667</longitude></position></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });
});

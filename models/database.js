var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123123@localhost:5432/postgres';

pg.connect(connectionString, function(err, client, done) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }

  client.query('CREATE TABLE users(id serial PRIMARY KEY, data xml not null)')
  done();

  client.query("INSERT INTO users (data) VALUES ('<user><id>1</id><gender>Male</gender><first_name>Robert</first_name><last_name>Richards</last_name></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });

  client.query("INSERT INTO users (data) VALUES ('<user><id>2</id><gender>Female</gender><first_name>Louise</first_name><last_name>Moore</last_name></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });

  client.query("INSERT INTO users (data) VALUES ('<user><id>3</id><gender>Female</gender><first_name>Brenda</first_name><last_name>Robinson</last_name></user>')", function(err, result) {
    done();
    if (err)
     { return console.error(err); }
  });
});

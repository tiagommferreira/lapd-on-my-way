var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var pg = require('pg');
var path = require("path");
var xml2js = require('xml2js');

app.use(bodyParser.json());
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123123@localhost:5432/postgres';

//root
app.get("/", function(req, res) {
  res.send("OK");
});

//get all users
app.get('/users', function (request, response) {
  pg.connect(connectionString, function(err, client, done) {
    client.query('SELECT data FROM users', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         var queryResponse = "<users>";
         result.rows.forEach(x => {
           queryResponse += x.data;
         });
         queryResponse += "</users>";

         response.setHeader('Content-Type', 'text/xml');
         response.send(queryResponse);
       }
    });
  });
});

//get specific user
app.get('/users/:id', function (request, response) {
  pg.connect(connectionString, function(err, client, done) {
    client.query("SELECT data FROM users WHERE (xpath('//user/id/text()', data))[1]::text = ($1)", [request.params.id], function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         var queryResponse = result.rows[0].data;

         response.setHeader('Content-Type', 'text/xml');
         response.send(queryResponse);
       }
    });
  });
});

//get user location
app.get('/users/:id/location', function (request, response) {
  pg.connect(connectionString, function(err, client, done) {
    //TODO: change query
    client.query("SELECT (xpath('//user/position', data))[1]::text FROM users WHERE (xpath('//user/id/text()', data))[1]::text = ($1)", [request.params.id], function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         var queryResponse = result.rows[0].xpath;

         response.setHeader('Content-Type', 'text/xml');
         response.send(queryResponse);
       }
    });
  });
});

//set user location
app.put('/users/:id/location', function (request, response) {

  pg.connect(connectionString, function(err, client, done) {
    //TODO: change query
    var oldUser;
    client.query("SELECT data FROM users WHERE (xpath('//user/id/text()', data))[1]::text = ($1)", [request.params.id], function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         oldUser = result.rows[0].data;
         xml2js.parseString(oldUser, function(err, result){
           oldUserObj = result;
         });

         oldUserObj.user.position[0].latitude[0] = request.body.latitude;
         oldUserObj.user.position[0].longitude[0] = request.body.longitude;

         client.query("UPDATE users SET data = ($1) WHERE (xpath('//user/id/text()', data))[1]::text = ($2)", [new xml2js.Builder().buildObject(oldUserObj),request.params.id], function(err, result) {
           done();
           if (err)
            { return console.error(err); }
          else {
            response.send("OK");
          }
         });

       }
    });



  });

});


var port = process.env.PORT || 5000;
app.listen(port, function() {
 console.log("Listening on " + port);
});

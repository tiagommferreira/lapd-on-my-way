var express = require("express");
var app = express();
var pg = require('pg');
var path = require("path");
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


/* serves all the static files */
/*
app.get(/^(.+)$/, function(req, res){
   console.log('static file request : ' + req.params);
   res.sendfile( __dirname + req.params[0]);
});
*/

var port = process.env.PORT || 5000;
app.listen(port, function() {
 console.log("Listening on " + port);
});

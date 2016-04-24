var express = require("express");
var app = express();
var pg = require('pg');
var path = require("path");
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/onmyway';

//root
app.get("/", function(req, res) {
  res.send("OK");
});

app.get('/db', function (request, response) {
  pg.connect(connectionString, function(err, client, done) {
    client.query('SELECT * FROM items', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         response.setHeader('Content-Type', 'application/json');
         response.send(JSON.stringify(result));
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

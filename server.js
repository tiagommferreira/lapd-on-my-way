var express       = require("express");
var app           = express();
var bodyParser    = require('body-parser');
var pg            = require('pg');
var path          = require("path");
var xml2js        = require('xml2js');

app.use(bodyParser.json());
var connectionString = process.env.DATABASE_URL || 'postgres://postgres:123123@localhost:5432/postgres';

//root
app.get("/", function(req, res) {
  res.send("OK");
});

app.post('/login', function(request, response) {
  //{"id":"523662227806349","name":"Tiago Ferreira","link":"https:\/\/www.facebook.com\/app_scoped_user_id\/523662227806349\/","gender":"male","first_name":"Tiago","last_name":"Ferreira"}
  var builder = new xml2js.Builder({headless: true, rootName: "user"});

  pg.connect(connectionString, function(err,client,done) {
    client.query("SELECT * FROM users WHERE (xpath('//user/fb_id/text()', data))[1]::text = ($1)", [request.body.id], function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         if(result.rows.length == 0) {
           console.log("No user with that fb id");
           //create new user in the database
           var newUser = [];
           newUser.fb_id = request.body.id;
           newUser.gender = request.body.gender;
           newUser.first_name = request.body.first_name;
           newUser.last_name = request.body.last_name;
           newUser.position = request.body.position;

           client.query("INSERT INTO users (data) VALUES ($1)", [builder.buildObject(newUser)], function(err,result) {
             done();
             if (err) {
               console.error(err); response.send("Error " + err);
             }
             else {
               response.send("OK");
             }

           });


         }
         else {
           console.log("User found");
           response.send("OK");
         }


       }
    });
  });


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
    client.query("SELECT data FROM users WHERE (xpath('//user/fb_id/text()', data))[1]::text = ($1)", [request.params.id], function(err, result) {
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
    client.query("SELECT (xpath('//user/position', data))[1]::text FROM users WHERE (xpath('//user/fb_id/text()', data))[1]::text = ($1)", [request.params.id], function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
         var queryResponse = result.rows[0].xpath;

         var position;
         xml2js.parseString(queryResponse, function(err, result){
           position = result;
         });

         response.setHeader('Content-Type', 'application/json');
         response.send({"latitude": position.position.latitude[0],"longitude":position.position.longitude[0]});

       }
    });
  });
});

//set user location
app.post('/users/:id/location', function (request, response) {

  pg.connect(connectionString, function(err, client, done) {

    var oldUser;
    client.query("SELECT data FROM users WHERE (xpath('//user/fb_id/text()', data))[1]::text = ($1)", [request.params.id], function(err, result) {
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

         var builder = new xml2js.Builder({headless: true});

         client.query("UPDATE users SET data = ($1) WHERE (xpath('//user/fb_id/text()', data))[1]::text = ($2)", [builder.buildObject(oldUserObj),request.params.id], function(err, result) {
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

app.get('/meetings', function(request, response)
{
	pg.connect(connectionString, function(err, client, done)
	{
		client.query("SELECT * FROM meetings", function(err, result)
		{
			done();
			if (err)
			{
				console.error(err);
				response.send("Error " + err);
			}
			else
			{
				response.setHeader('Content-Type', 'application/json');
				response.send(result.rows);
			}
		});
	});
});

app.get('/meetings/:meeting_id', function(request, response)
{
	pg.connect(connectionString, function(err, client, done)
	{
		client.query("SELECT * FROM meetings WHERE meeting_id = ($1)", [request.params.meeting_id], function(err, result)
		{
			done();
			if (err)
			{
				console.error(err);
				response.send("Error " + err);
			}
			else
			{
				response.setHeader('Content-Type', 'application/json');
				response.send(result.rows[0]);
			}
		});
	});
});

app.get('/meeting_users/:meeting_id', function(request, response)
{
	pg.connect(connectionString, function(err, client, done)
	{
		client.query("SELECT fb_id FROM meeting_users WHERE meeting_id = ($1)", [request.params.meeting_id], function(err, result)
		{
			done();
			if (err)
			{
				console.error(err);
				response.send("Error " + err);
			}
			else
			{
				response.setHeader('Content-Type', 'application/json');
				response.send(result.rows);
			}
		});
	});
});

app.get('/user_meetings/:fb_id', function(request, response)
{
	pg.connect(connectionString, function(err, client, done)
	{
		client.query("SELECT meeting_id FROM meeting_users WHERE fb_id = ($1)", [request.params.fb_id], function(err, result)
		{
			done();
			if (err)
			{
				console.error(err);
				response.send("Error " + err);
			}
			else
			{
				response.setHeader('Content-Type', 'application/json');
				response.send(result.rows);
			}
		});
	});
});

app.post('/meeting', function(request, response)
{
	pg.connect(connectionString, function(err, client, done)
	{
		client.query("INSERT INTO meetings(meeting_date, location) VALUES($1, $2)", [request.params.date, request.params.location], function(err, result)
		{
			done();
			if (err)
			{
				console.error(err);
				response.send("Error " + err);
			}
			else
			{
				client.query("SELECT MAX(meeting_id) FROM meetings", function(err, result)
				{
					done();
					var id = result.rows[0];
					request.params.users.forEach(x => {
						client.query("INSERT INTO meeting_users(meeting_id, fb_id) VALUES($1, $2)", [id, x], function(err, result));
					});
				});
			}
		});
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
 console.log("Listening on " + port);
});

const express = require('express'),
	  path = require('path'),
	  bodyParser = require("body-parser"),
	  app = express(),
	  db = require('./models/database').createDatabase();

require('./controllers/db').init(db);
require('./controllers/logger')(app);
require('./controllers/routers')(app);
require('./controllers/swagger')(app);

//set up the template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Run the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
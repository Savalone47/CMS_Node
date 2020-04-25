const express = require('express');
const path = require('path');
const app = express();
const db = require('./models/database').createDatabase();

require('./controllers/db').init(db);
require('./controllers/logger')(app);
require('./controllers/routers')(app);
require('./controllers/swagger')(app);

//set up the template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Parser 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Run the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));

// process stdout or stdin
process.on('SIGINT', () => {
    console.log("Close signal received");
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Closing connection to database");
        db.close();
        console.log("Server shutdown");
    });
});
module.exports = app;
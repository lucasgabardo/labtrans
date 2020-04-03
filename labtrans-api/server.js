const express = require('express');
const app = express();
const port = 3000;

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('src/data/sqlitedb');
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./src/routes')(app, db);

app.listen(port, () => {
    console.log('Backend NodeJS live on ' + port);
});


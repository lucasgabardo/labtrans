const imageGetRoutes = require('./image-get-route');
const imagePostRoutes = require('./image-post-route');
const itemGetRoutes = require('./item-get-route');
const itemPostRoutes = require('./item-post-route');
const imagePutRoutes = require('./image-put-route');
const itemDeleteRoutes = require('./item-delete-route');
const loadDatabase = require('../data/setup-database');

module.exports = function (app, db) {

  // create database in case it was not created yeat, 
  // or update in case of migrations
  loadDatabase(db);

  // start routes
  imageGetRoutes(app, db);  
  imagePostRoutes(app, db);
  itemGetRoutes(app, db);
  itemPostRoutes(app, db)
  imagePutRoutes(app, db);
  itemDeleteRoutes(app, db);

};

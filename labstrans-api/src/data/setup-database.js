var fs = require('fs');
var sqlImageSchema = fs.readFileSync('src/data/image-schema.sql').toString();
var sqlItemSchema = fs.readFileSync('src/data/item-schema.sql').toString();

module.exports = function(db) {
    db.serialize(function() {
        db.run(sqlImageSchema);
        db.run(sqlItemSchema);
    });
};



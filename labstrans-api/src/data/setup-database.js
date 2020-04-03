var fs = require('fs');
var sqlImageSchema = fs.readFileSync('app/data/image-schema.sql').toString();
var sqlItemSchema = fs.readFileSync('app/data/item-schema.sql').toString();

module.exports = function(db) {
    db.serialize(function() {
        db.run(sqlImageSchema);
        db.run(sqlItemSchema);
    });
};



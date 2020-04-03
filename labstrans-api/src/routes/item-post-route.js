var cors = require('cors');

module.exports = function (app, db) {
    app.use(cors());
    app.post('/api/item/', (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");

         var data = req.body;
         
         if((data.constructor === Array))
            processItems(req, res, db);
         else
            processImage(req, res, db);
    });
};

function processItems(req, res, db){
    for (var item of req.body) {
        insertItem(item, res, db);
    }
}

function processImage(req, res, db){
    validateRequest(req, res);
    insertItem(req.body, res, db);
}

function insertItem(item, res, db){
    var description = item.description;
    var color = item.color;
    var imageId = item.imageId;
    var position = item.position;
    var sql = `insert into Items (description, color, imageId, position) 
            VALUES 
            (?, ?, ?, ?);`;

    var values = [description, color, imageId, position];

    db.serialize(function () {
        db.run(sql, values, function (err) {
            if (err){
                console.error(err);
                res.status(500).send(err);
            }
                
            else
                res.send();
        });
    });
}

function validateRequest(req, res) {
    var fs = require('fs');
    var schema = JSON.parse(fs.readFileSync('src/data/item-schema.json', 'utf8'));

    var JaySchema = require('jayschema');
    var js = new JaySchema();
    var instance = req.body;

    js.validate(instance, schema, function (errs) {
        if (errs) {
            console.error(errs);
            res.status(400).send(errs);
        }
    });

    if (req.body.id) {
        res.status(400).send("ID cannot be submmited");
    }
}
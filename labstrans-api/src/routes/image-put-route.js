module.exports = function (app, db) {
    app.put('/api/image/', (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");

         var data = req.body;
         
         if((data.constructor === Array))
            processImages(req, res, db);
         else
            processImage(req, res, db);
    });
};

function processImages(req, res, db){
    for (var image of req.body) {
        updateImage(image, res, db);
    }
}

function processImage(req, res, db){
    validateRequest(req, res);
    updateImage(req.body, res, db);
}

function updateImage(image, res, db){
    var id = image.id;
    var name = image.name;
    var processed = image.processed;
    var path = image.path;

    var sql = `update Images
            set name = ?, processed = ?, path = ?
            where id = ?;`;

    var values = [name, processed, path, id];

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
    var schema = JSON.parse(fs.readFileSync('app/data/image-schema-update.json', 'utf8'));

    var JaySchema = require('jayschema');
    var js = new JaySchema();
    var instance = req.body;

    js.validate(instance, schema, function (errs) {
        if (errs) {
            console.error(errs);
            res.status(400).send(errs);
        }
    });
}
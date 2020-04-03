module.exports = function (app, db) {
    app.delete('/api/item/', (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");

         var data = req.body;
         
         if((data.constructor === Array))
            processItems(req, res, db);
         else
            processItem(req, res, db);
    });
};

function processItems(req, res, db){
    for (var prod of req.body) {
        updateItem(prod, res, db);
    }
}

function processItem(req, res, db){
    updateItem(req.body, res, db);
}

function updateItem(item, res, db){
    var id = item.id;

    if(!id){
        res.status(400).send("ID is mandatory");
    }

    else{
        var sql = `delete from  Items where id = ?;`;
        var values = [id];

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
}


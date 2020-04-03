module.exports = function(app, db) {

  app.get('/api/image/id/:id', (req, res) => {
    processData(res, "SELECT * FROM images where id == "+req.params.id);
  });

  app.get('/api/image/:attribute/:name', (req, res) => {
    processData(res, "SELECT * FROM images where "+req.params.attribute+" = '"+req.params.name+"'");
  });

  app.get('/api/image', (req, res) => {
    processData(res, "SELECT * FROM images");
  });

  app.get('/api/image/sort/:way', (req, res) => {
    processData(res, "SELECT * FROM images order by " + req.params.way);
  });

  app.get('/api/image/sort/:direction/:way', (req, res) => {
    var way = req.params.way;
    var direction = req.params.direction;

    if(direction !== "asc" && 
        direction !== "desc"){
      res.status(404).send("Sorting direction invalid!");
    }

    processData(res, "SELECT * FROM images order by " + way + " " + direction);
  });

  function processData(res, sql){
    db.serialize(function() {
      db.all(sql, 
        function(err, rows) {
          if(err){
            console.error(err);
            res.status(500).send(err);
          }
          else
            sendData(res, rows, err);
      });
    });
  }

  function sendData(res, data, err){
    res.setHeader("Access-Control-Allow-Origin","*");

    if(data[0])
      res.send(data);
    
    else{
      res.status(404).send("image not found");
    }
  }
};
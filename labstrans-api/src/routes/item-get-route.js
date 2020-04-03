module.exports = function(app, db) {
    app.get('/api/item/id/:id', (req, res) => {
      processData(res, "SELECT * FROM items where id == "+req.params.id);
    });
  
    app.get('/api/item/:attribute/:name', (req, res) => {
      processData(res, "SELECT * FROM items where "+req.params.attribute+" = '"+req.params.name+"'");
    });
  
    app.get('/api/item', (req, res) => {
      processData(res, "SELECT * FROM items");
    });

    app.get('/api/item/sort/:way', (req, res) => {
      processData(res, "SELECT * FROM items order by " + req.params.way);
    });
  
    app.get('/api/item/sort/:direction/:way', (req, res) => {
      var way = req.params.way;
      var direction = req.params.direction;
  
      if(direction !== "asc" && 
          direction !== "desc"){
        res.status(404).send("Sorting direction invalid!");
      }
  
      processData(res, "SELECT * FROM items order by " + way + " " + direction);
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
        res.status(404).send("item not found");
      }
    }
  };
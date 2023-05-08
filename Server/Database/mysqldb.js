var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database : "vetrikodi"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Mysql Db Connected Sucessfully!");
  });
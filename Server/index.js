const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const path = require('path');
const fs = require('fs');
//const mongodbsss = require("./Database/mongodb")

var mongoose = require("mongoose");
mongoose.set('strictQuery', true);
var url = "mongodb://127.0.0.1:27017/epaper";

mongoose.Promise = global.Promise;

// Today date
const today = new Date();
const date = today.setDate(today.getDate());
const defaultValue = new Date(date).toISOString().split('T')[0]
console.log(defaultValue);
const defaultPages = 'Front'

const app = express();
const port = 3300;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );

app.get('/', (req, res) => {
    res.send('welcome to my webpage')
})


app.get('/fetchnews', (req, res) => {

    const { date } = req.query;
    const currentDate = date || new Date().toISOString().slice(0, 10);;

    mongoose.connect(url, function (err, db) {
        if (err) throw err;
        // db.collection("vetrikodi").find({}).toArray(function (err, result) {
        db.collection("vetrikodi").find({ Date: currentDate, Pagename: defaultPages }).toArray(function (err, result) {
            if (err) throw err;
            console.log(err);
            res.send(result);
            console.log(result);
            mongoose.disconnect();
        });
    }); 
});

app.get('/fetchnews/:Pages', (req, res) => {
    const { Pages } = req.params || defaultPages;
    console.log(Pages);
    
    mongoose.connect(url, function (err, db) {
      if (err) throw err;
  
      db.collection("vetrikodi").find({ Date: "2023-02-17", Pagename: Pages }).toArray(function (err, result) {
        if (err) throw err;
        console.log(err);
        res.send(result);
        console.log(result);
        mongoose.disconnect();
      });
    });
  });


app.post('/postnews', (req, res) => {
    const date = req.body.Date;
    console.log(date);
    mongoose.connect(url, function (err, db) {
        if (err) throw err;
        db.collection("vetrikodi").find({ Date: date, Pagename: defaultPages }).toArray(function (err, result) {
            if (err) throw err;
            console.log(err);
            res.send(JSON.stringify({ "status": 200, "error": null, "response": result }));
            console.log(result);
            mongoose.disconnect();
        });
    });

})




const ObjectId = require('mongodb').ObjectId;

app.post('/news/id', (req, res) => {
    const Id = req.body.id
    console.log(Id);
    mongoose.connect(url, function (err, db) {
        if (err) throw err;
        // db.collection("vetrikodi").findOne({ _id: ObjectId(Id) },function (err, result) {
        db.collection("vetrikodi").find({ _id: ObjectId(Id) }).toArray(function (err, result) {
            if (err) throw err;
            console.log(err);
            res.send(JSON.stringify({ "status": 200, "error": null, "response": result }));
            console.log(result);
            mongoose.disconnect();
        });
    });

})


app.get('/news/share', (req, res) => {
    const {Id} = req.query.Id;
    console.log(Id);
    mongoose.connect(url, function (err, db) {
        if (err) throw err;
        db.collection("vetrikodi").find({ _id: ObjectId(Id) }).toArray(function (err, result) {
            if (err) throw err;
            console.log(err);
            res.send(JSON.stringify({ "status": 200, "error": null, "response": result }));
            console.log(result);
            mongoose.disconnect();
        });
    });
});

app.post('/pagenews', (req, res) => {
    const date = req.body.Date;
    const pagename = req.body.Pagename;
    console.log(date);
    mongoose.connect(url, function (err, db) {
        if (err) throw err;
        db.collection("vetrikodi").find({ Date: date||defaultValue, Pagename: pagename }).toArray(function (err, result) {
            if (err) throw err;
            console.log(err);
            res.send(JSON.stringify({ "status": 200, "error": null, "response": result }));
            console.log(result);
            mongoose.disconnect();
        });
    });

})



// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


app.get('/api/pdf', (req, res) => {
    const { date } = req.query;
    console.log(date)

    // Construct the path to the PDF file based on the requested date
    const pdfPath = path.join(__dirname, 'pdfs', `${date}.pdf`);

    // Check if the file exists
    fs.access(pdfPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(err);
            res.status(404).send('PDF file not found');
        } else {
            // Set the response headers to indicate that this is a PDF file
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${date}.pdf"`);
            // Stream the PDF file to the client
            fs.createReadStream(pdfPath).pipe(res);
        }
    });
});








const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "quizdata",
    connectionLimit: 10,
  });
  
  // Define routes for fetching categories, levels, and quiz questions
  app.get("/", (req, res) => {
    res.send("welcome to my page");
  });
  
  app.get("/userName", async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query("SELECT userid ,name FROM userdata");
      connection.release();
      res.json({ name: rows });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching name from the database");
    }
  });
  
  app.post("/categories", async (req, res) => {
    const level = req.body.level;
  
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query("SELECT DISTINCT category FROM quizfulldata WHERE level=?", [level]);
      connection.release();
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching topics from the database");
    }
  });
  
  app.get("/levels", async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query("SELECT DISTINCT level FROM quizfulldata");
      connection.release();
      res.json({ levels: rows });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching levels from the database");
    }
  });
  
  app.post("/topic", async (req, res) => {
    const category = req.body.category;
    const level = req.body.level;
  
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query("SELECT DISTINCT topic,category, topicid FROM quizfulldata WHERE category=? AND level=?", [category, level]);
      connection.release();
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching topics from the database");
    }
  });
  
  app.post("/topic/topicid", async (req, res) => {
    const userId = req.body.userid;
  
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query("SELECT * FROM result WHERE userid=?", [userId]);
      connection.release();
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching topics from the database");
    }
  });
  
  app.post("/Profile", async (req, res) => {
    const userId = req.body.userid;
  
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query("SELECT * FROM userdata WHERE userid=?", [userId]);
      connection.release();
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching topics from the database");
    }
  });
  
  app.post("/questions", async (req, res) => {
    const category = req.body.category;
    const level = req.body.level;
    const topic = req.body.topic;
  
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query("SELECT * FROM quizfulldata WHERE category=? AND level=? AND topic=?", [category, level, topic]);
      connection.release();
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching questions from the database");
    }
  });
  
  app.post("/dailyquestions", async (req, res) => {
    const level = req.body.level;
    const userid = req.body.userid;
  
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query("SELECT * FROM dailyquizdata WHERE level = ? AND user_attended != ? ORDER BY RAND() LIMIT 10", [level, userid]);
      connection.release();
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching questions from the database");
    }
  });
  
  app.post("/result", async (req, res) => {
    const userid = req.body.userid;
    const username = req.body.username;
    const topicid = req.body.topicid;
    const mark = req.body.mark;
  
    try {
      
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.query(
        `
        INSERT INTO result (userid,name, topicid, mark)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          topicid = CONCAT(topicid, ',', ?),
          mark = CONCAT(mark, ',', ?)
        `,
        [userid, username, topicid, mark, topicid, mark]
      );
      connection.release();
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating the result");
    }
  });
  
  
  
  app.post('/dailyresult', async (req, res) => {
    const userid = req.body.userid;
    const username = req.body.username;
    const date = req.body.date;
    const score = req.body.mark;
  
    try {
      // get a connection from the pool
      const connection = await pool.getConnection();
  
      // start a transaction
      await connection.beginTransaction();
  
      // prepare the SQL statement
      const statement = `
        INSERT INTO dailyquizresult (userid, name, date, score)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          score = CONCAT(score, ',', ?)
      `;
      const values = [userid, username, date, score, score];
      const [rows, fields] = await connection.query(statement, values);
  
      // commit the transaction
      await connection.commit();
  
      // release the connection back to the pool
      connection.release();
  
      res.json(rows);
    } catch (err) {
      console.error(err);
  
      // rollback the transaction if an error occurred
      if (connection) {
        await connection.rollback();
        connection.release();
      }
  
      res.status(500).send('Error updating the result');
    }
  });







app.listen(port, (req, res) => {
    console.log("Server is running port : " + port);
})
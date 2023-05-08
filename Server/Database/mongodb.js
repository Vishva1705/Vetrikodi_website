var mongoose = require("mongoose");
mongoose.set('strictQuery', false);
var url ="mongodb://127.0.0.1:27017/epaper";


mongoose.Promise = global.Promise;
 
// Connect Mongodb Database
mongoose.connect(url, { useNewUrlParser: true })
.then(() => { 
    console.log('Mongo Database is connected') },
err => { 
    console.log('There is problem while connecting database ' + err) }
); 














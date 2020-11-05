const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
// const date = require(__dirname + "/date.js");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


var callback = function(err){
  if (err){
    console.log(err);
  } else {
    console.log("Sucsess !");
  }
}
//Connecting Databases
mongoose.connect("mongodb://localhost:27017/LISTAPP", {useNewUrlParser: true, useUnifiedTopology:true})

//Creating Mongoose Scheama
const listSchema = new mongoose.Schema({
  title: String,
  items: [{
    type: String
  }]
})

//Creating Mongose Model
const ListModel = mongoose.model("List", listSchema)


const items = ["Buy Food", "Cook Food", "Eat Food"];

app.get("/", function(req, res) {
  // const day = date.getDate();
  ListModel.find({}, function(err, result){
    res.render("list", {
      listTitle: "today",
      newListItems: result
    });
  })
});

app.post("/", function(req, res) {
  const item = req.body.newItem;
  const listItem = new ListModel({
    title:"today",
    items: item
  })
  listItem.save()
  res.redirect("/");
});

app.post("/delete", function(req,res){
   let checkbox = req.body.checkbox
   ListModel.findOneAndRemove({_id:checkbox}, function(err){
     if(err)
     console.log(err)
     else
     console.log(" Deleted Sucssfully");
   })
   res.redirect("/")
})

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

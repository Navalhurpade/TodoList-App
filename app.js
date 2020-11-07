const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

let customListTitle = ""
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const day = date.getDay();

//Connecting Databases
mongoose.connect("mongodb://localhost:27017/LISTAPP", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

//Creating Mongoose Scheama
const listSchema = new mongoose.Schema({
  title: String,
  items: [String]
})

//Creating Mongose Model
const ListModel = mongoose.model("List", listSchema)


app.get("/:customListTitle", function(req, res) {
  customListTitle = req.params.customListTitle

//Searching if List Already Exits Or not !
  ListModel.findOne({
    title: customListTitle
  }, function(err, result) {
    if (!err) {      //if no erorr


      //IF NO result found ONLY THEN creating new
      //document wjere titel: is set to Current Custom List Titl
      if (!result) {
        const customItem = new ListModel({
          title: customListTitle,
          items: "Wellcome"
        })
        customItem.save()

        res.redirect("/" + customListTitle)

     //After creating a Document Reading it through find()
      } else {
        ListModel.findOne({
          title: customListTitle
        }, function(err, data) {
          if (!err) {
            res.render("list", {
              listTitle: customListTitle,
              newListItems: data.items
            })
          } else {         //Erorr loging
            console.log(err + "Erorr While reading " + customListTitle)
          }
        })
      }
    } else {             //Erorr loging
      console.log(err+" EORR While Finding document ")
    }
  })
})

app.get("/", function(req, res) {
  ListModel.findOne({
    title: "Today"
  }, function(err, result) {
    res.render("list", {
      listTitle: day,
      newListItems: result.items
    });
  })
})

app.post("/", function(req, res) {
  const item = req.body.newItem

  //Checking if title exits in const DaysOfWeek
  if (daysOfWeek.includes(req.body.listTitle)) {
    ListModel.findOne({title: "Today"}, function(err, foundlist){
      if (!err) {
        if (!foundlist) {
          const welcomeItem = new ListModel({
            title: "Today",
            items: "Wellcome"
          })
          welcomeItem.save()
        }else {
          foundlist.items.push(item)
          foundlist.save()
        }
      }else {
        console.log(err+ "  Erorr while finding today in list");
      }
    })
    res.redirect("/")


    // Else Setting Title To custom  String
  } else {
    ListModel.findOne({title: customListTitle}, function(err, foundlist){
    if (!err) {

      //if Data NOT found then Creating List With custom Title
      if (!foundlist) {
        const customListItem = new ListModel({
          title: customListTitle,
          items: item
        })
        customListItem.save()


      //Ones List is created then ONLY push new item into it
      }else {
        foundlist.items.push(item)
        foundlist.save()
      }
    }else {              //Loging Eorrs
      console.log(err+"Erorr While finding Custom list");
    }
  })
  res.redirect("/" + customListTitle)
  }
})

app.post("/delete", function(req, res) {
  let index = req.body.index
  let listTitle = req.body.listTitleIndelete

 if (daysOfWeek.includes(listTitle)) {
  ListModel.findOne({
    title: "Today"
  }, function(err, thislist) {
    if (!err){
      thislist.items.splice(index,1)
      thislist.save()
    }
  })
    res.redirect("/")
} else {
  ListModel.findOne({
    title: listTitle
  }, function(err, thislist) {
    if (!err){
      if (!thislist) {
        console.log("this list is empty");
      } else {
      thislist.items.splice(index,1)
      thislist.save()
      }
 res.redirect("/"+customListTitle)
      }
    }
  )}
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

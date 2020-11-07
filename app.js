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
  items: [{
    type: String
  }]
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
        ListModel.find({
          title: customListTitle
        }, function(err, data) {
          if (!err) {
            res.render("list", {
              listTitle: customListTitle,
              newListItems: data
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
  ListModel.find({
    title: "Today"
  }, function(err, result) {
    res.render("list", {
      listTitle: day,
      newListItems: result
    });
  })
})

app.post("/", function(req, res) {
  const item = req.body.newItem

  //Checking if title exits in const DaysOfWeek
  if (daysOfWeek.includes(req.body.listTitle)) {

    // If found !, Adding Item in Database with Title == "Today"
    const listItem = new ListModel({
      title: "Today",
      items: item
    })
    listItem.save(function(err) {
      if (err)
        console.log(err+" ERORR while Adding New item to the document")
    })
    res.redirect("/")


    // Else Setting Title To custom  String
  } else {
    const customListItem = new ListModel({
      title: customListTitle,
      items: item
    })
    customListItem.save()
    res.redirect("/" + customListTitle)
  }
})

app.post("/delete", function(req, res) {
  let checkbox = req.body.checkbox
  ListModel.findOneAndRemove({
    _id: checkbox
  }, function(err) {
    if (err)
      console.log(err+" ERROr While Deleting")
  })

  if (daysOfWeek.includes(req.body.listTitle))
  res.redirect("/")
  else 
  res.redirect("/"+customListTitle)

})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

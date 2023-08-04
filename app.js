const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//mongoose mongodb database connection
const url = "mongodb+srv://parthrathor:test123@cluster1.mqwqws6.mongodb.net/todolistDB"; //mongodb atlas cloud connection string
mongoose.connect(url).then(function () {
  console.log("Connected to mongoDB cloud database");
})
  .catch(function (err) {
    console.log(err);
  })

//creating mongoose schema
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = new mongoose.model("Item", itemSchema);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//creating todolist default items
const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item." });
var items = [];
const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name:String,
  items: [itemSchema]
});

const List = new mongoose.model("List",listSchema);

app.get("/", function (req, res) {
  
   Item.find({})
   .then(function (foundItems) {
    foundItems.forEach(element => {
      items.push(element);
      // console.log(element.name);
    });
      if (Number(items.length) === 0) {
        console.log(items.length+"in 2");
         Item.insertMany(defaultItems);
        res.redirect("/");
      }
      else {
        res.render("list", { listTitle: "Today", newListItems: items });
        items = [];
      }
    });
});


app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}).then(function(foundlist){
        if(!foundlist){
          const list = new List ({
            name:customListName,
            items:defaultItems
          });
          list.save();
          console.log("Addedlist "+ customListName);
          res.redirect("/"+customListName);
        }
        else{
          console.log("foundlist "+foundlist.name);
          res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items });
        }
    });
})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName === "Today"){
  item.save().then(function (singleItem) {
    console.log("Saved item: " +singleItem.name);
    res.redirect("/");
  })
}
  else{
    List.findOne({name:listName}).then(function(foundlist){
      foundlist.items.push(item);
      foundlist.save();
      console.log("Saved item into "+ (foundlist.name)+"list: " +(item.name));
      res.redirect("/"+ listName);
    })
  }
});

app.post("/delete",function(req,res){

  const itemName = (req.body.checkbox);
  const listName= req.body.listName;
  console.log(req.body.listName);

  if(listName ==="Today"){
  Item.deleteOne({name:itemName}).then(function(){
    console.log("Deleted item: "+itemName);
  }).catch(function(err){
    console.log(err);
  }).finally(function(){
    res.redirect("/");
  })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{name:itemName}}}).then(function(foundlist){
      console.log("Deleted item in "+ foundlist.name +"list: "+itemName);
      res.redirect("/"+listName)
    })
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

// mongoose.connection.close()
//mongodbpath: "\\wsl.localhost\Ubuntu-22.04\var\lib\mongodb"
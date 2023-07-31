const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//mongoose mongodb database connection
const url = "mongodb://127.0.0.1:27017/todolistDB";
mongoose.connect(url).then(function () {
  console.log("Connected to mongoDB database");
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
      items.push(element.name);
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

    const customListName = req.params.customListName;
    
    List.findOne({name:customListName}).then(function(foundlist){
        if(!foundlist){
          const list = new List ({
            name:customListName,
            items:defaultItems
          });
          list.save();
          console.log("Addedlist"+ customListName);
          res.redirect("/"+customListName);
        }
        else{
          console.log("found"+foundlist.name);
          res.render("list", { listTitle: foundlist.name, newListItems: foundlist.items });
        }
    });
})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  })

  item.save().then(function (singleItem) {
    console.log("Saved item: " +singleItem.name);
    res.redirect("/");
  })
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const deleteItem = req.body.checkbox;
  Item.deleteOne({name:deleteItem}).then(function(){
    console.log("Deleted item :"+deleteItem);
  }).catch(function(err){
    console.log(err);
  }).finally(function(){
    res.redirect("/");
  })

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

// mongoose.connection.close()
//mongodbpath: "\\wsl.localhost\Ubuntu-22.04\var\lib\mongodb"
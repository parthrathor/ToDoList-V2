const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//mongoose mongodb database connection
const url = "mongodb://127.0.0.1:27017/todolistDB";
mongoose.connect(url).then(function(){
  console.log("Connected to mongoDB database");
})
.catch(function(err){
  console.log(err);
})


//creating mongoose schema
const itemSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  }
});

const Item = new mongoose.model ("Item",itemSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var items = [];
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

//creating todolist default items
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

// Item.insertMany(defaultItems).then(function(){
//   console.log("Default Items inserted");
// })
// .catch(function(err){
//   console.log(err);
// })


Item.find({}).then(function (result) {
      mongoose.connection.close()
      result.forEach(element => {
          items.push(element.name)
          
      });
      }).catch(function(err){
      console.log(err);
      }).finally(function(){
        console.log(items);
      })
 
      
app.get("/", function(req, res) {
  res.render("list", {listTitle: "Today", newListItems: items});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item = new Item({
    name:itemName
  })

  item.save();

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// mongoose.connection.close()
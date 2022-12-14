//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jessica:leopards4life@cluster0.nwlh07j.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Buy Groceries"
});

const item2 = new Item ({
  name: "Clean Floors"
});

const item3 = new Item ({
  name: "Empty Trash"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
const day = date.getDate();

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        };
      });
      res.redirect("/");
    } else {
  res.render("list", {listTitle: day, newListItems: foundItems});
};
});
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === day) {
  item.save();
  res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if (listName === day) {
  Item.findByIdAndRemove(checkedItemId, function(err) {
    if (!err) {
      console.log("Successfully deleted item.");
      res.redirect("/");
    };
  });
} else {
    List.findOneAndUpdate({
      name: listName},
      {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        };
      });
    };
  });


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
   
  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
      name: customListName,
    items: defaultItems
  });
    list.save();
    res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      };
      };
    });
  });   

app.get("/about", function(req, res){
  res.render("about");
});


const server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
const server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port.', server_port);
});

// const port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }

// app.listen(port, function() {
//   console.log("Server started successfully.");
// });

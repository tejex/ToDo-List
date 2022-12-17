const express = require("express")
const bodyParser = require("body-parser")
const mongoose =  require("mongoose")
const _ = require("lodash")

const app = express()

app.set('view engine', 'ejs');
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))

//******************************************************************************************************************//



const password = encodeURIComponent("Gtalebron@23")
const uri = `mongodb+srv://bamMongo23:${password}@cluster0.wvbvubq.mongodb.net/toDoListDB`;
mongoose.connect(uri, { useNewUrlParser: true})



const itemSchema = new mongoose.Schema({
  name:{
    type:String,
    required: [true, "Cannot leave this input empty"]
  }
})

//******************************************************************************************************************//

const Item = new mongoose.model("Item", itemSchema)

//******************************************************************************************************************//
const getCoffee = new Item({
  name:"Get Coffee"
})

const deepWork = new Item({
  name:"Do Deep Work"
})

const workOut = new Item({
  name: "Workout"
})

const defaultItems = [getCoffee, deepWork, workOut];

//******************************************************************************************************************//

//This is the schema fro a new list that we will create with ejs dyanic routes
//every list created must follow this schema, with the items key having a value that is an array of
//itemsSchema based items

const listSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  items:[itemSchema]
})
const List = new mongoose.model("List", listSchema)

//******************************************************************************************************************//
app.get("/", function(req, res) {

Item.find(function(err, items){

  if(items.length===0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully added items");
      }
    })
    res.redirect("/")
  }
  else{
    res.render("list", {listTitle: "Today", newItem:items})
  }

})
})

//******************************************************************************************************************//
app.post("/", function(req,res){
const item = req.body.newItem
const currentList = req.body.list;


const newItem = new Item({
  name:item
});

if(currentList === "Today"){
  newItem.save();
  res.redirect("/")
}
else{
  List.findOne({name:currentList}, function(err, foundList){
    if(!err){
      foundList.items.push(newItem)
      foundList.save();
      res.redirect("/" + currentList)
    }
  })
}

})
//******************************************************************************************************************//
app.post("/deleteItem", function(req,res){
  const itemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName ==="Today"){
    Item.deleteOne({_id:itemId}, function(err){
      if(err){
        console.log(err);
      }
    })
    res.redirect("/")
  }
  else{
      List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:itemId}}}, function(err, foundList){
        if(!err){
          res.redirect("/" + listName)
        }
      })
  }
})

//******************************************************************************************************************//

//This is going to allow us to make new lists and add new items to those lists as well
//we will use express route parameters to create these dynamic routes
app.get("/:customListName", function(req, res){
  const customListName =   _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, listFound){
    if(!err){
      if(!listFound){
        //Create a new list
        const list = new List({
          name:customListName,
          items:defaultItems
        })
        list.save()
        res.redirect("/" + customListName)
      }
      else{
        //show an existing list
        res.render("list", {listTitle: listFound.name, newItem:listFound.items})
      }
    }
    else{
      console.log(err);
    }
  })
})

//******************************************************************************************************************//

app.post("/work",function(req,res){
  const item = req.body.newItem;
  workItems.push(item)
  res.redirect("/work")
})
//******************************************************************************************************************//

app.get("/about",function(req,res){
  res.render("about")
})
//******************************************************************************************************************//

app.listen("3000", function() {
  console.log("server is up and running")
})
//******************************************************************************************************************//

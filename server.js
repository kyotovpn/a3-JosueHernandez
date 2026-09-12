require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require('mongodb'); 
const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.PASSWORD}@${process.env.HOSTDB}`;
const express = require("express");
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app = express();
app.use(express.static("public"));
app.use(express.json());
let collection = null;

async function run() {
  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
  const database = await client.db("ClickerGame");
  collection = database.collection("data");
  console.log("connected to db");
}
run().catch(console.dir);
const deriveFields = function (row) {
  row.cps = Number((row.score / 10).toFixed(2));
  return row;
};

const middleware_post = async (req, res, next) => {
  try {
    const newData = req.body;

    await collection.insertOne(newData);
    console.log(collection.find({}).toArray());
    res.json(newData);
  } catch (err) {
    console.log("error");
  }
};

const middleware_get = async (req, res, next) => {
  try {
    const cursor = collection.find({});

    let dataToSend = await cursor.toArray();
    dataToSend.forEach(deriveFields);
    console.log(dataToSend);

    res.send(JSON.stringify(dataToSend));
  } catch (err) {
    console.error(err);
    res.status(500).send("error loading scores");
  }
};

const middleware_delete = async (req, res, next) => {
  try {
    const query = { _id: new ObjectId(req.body._id)};
    console.log(query)
    const deleteResult = await collection.deleteOne(query);
    res.send(JSON.stringify(deleteResult));
  } catch (err) {
    console.error(err);
    res.status(500).send("error deleting scores");
  }

};

app.use(express.static("./"));

app.post("/submit", middleware_post);
app.get("/getData", middleware_get);
app.post("/delete", middleware_delete);

const listener = app.listen(process.env.PORT || 3000);

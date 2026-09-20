require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require('mongodb'); 
const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.PASSWORD}@${process.env.HOSTDB}`;
const express = require("express");

const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
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

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session());

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.envGITHUB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
     return done(null, profile);
  }
));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));


app.get('/me', (req, res) => {
  res.json({ loggedIn: req.isAuthenticated(), user: req.user || null });
});
app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.redirect('/');
    res.redirect('/');
  });
});

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

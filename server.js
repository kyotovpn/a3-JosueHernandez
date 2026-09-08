const express = require("express"),
  app = express(),
  gameData = [
    { score: 17, name: "Joe", date: "Mon Aug 31 2026" },
    { score: 34, name: "Peter", date: "Tue Sep 01 2026" },
    { score: 46, name: "Evil Chicken", date: "Wed Sep 02 2026" },
    { score: 51, name: "Jeff", date: "Thur Sep 03 2026" },
  ];
app.use(express.static("public"));
app.use(express.json() );

const middleware_post = (req, res, next) => {
   gameData.push(deriveFields(req.body));
   res.send(JSON.stringify(gameData));
};

const middleware_get = (req, res, next) => {
  res.json(gameData);
};

const middleware_delete = (req, res, next) => {
  let data = req.body
  const indx = gameData.findIndex(
    (row) =>
      row.name === data.name &&
      row.score === data.score &&
      row.date === data.date,
  );
  if (indx !== -1) gameData.splice(indx, 1);
  res.send('deleted');
};

app.use(express.static("./"));

app.post("/submit", middleware_post);
app.get("/getData", middleware_get);
app.post("/delete", middleware_delete);

const deriveFields = function (row) {
  row.cps = Number((row.score / 10).toFixed(2));
  return row;
};
gameData.forEach(deriveFields);
const listener = app.listen(process.env.PORT || 3000);
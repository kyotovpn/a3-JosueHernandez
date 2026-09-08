// FRONT-END (CLIENT) JAVASCRIPT HERE
let score = 0;
let time = 9;
let hasRun = false;
let intervalId;

const timer = document.getElementById("timer");
const currentScore = document.getElementById("scoreBoard");
const button = document.getElementById("clicker");
const sumbitScore = document.getElementById("sumbitScore");
const form = document.getElementById("scoreForm");
const instructions = document.getElementById("instructions");

//helper functions
function showButton() {
  button.style.display = "block";
}
function hideButton() {
  button.style.display = "none";
}
function showForm() {
  form.style.display = "block";
}
function hideForm() {
  form.style.display = "none";
}
function showInstruct() {
  instructions.style.display = "block";
}
function hideInstruct() {
  instructions.style.display = "none";
}

function editTimer() {
  timer.textContent = `TME LEFT: ${time}`;
  time--;
  if (time < 0) {
    clearInterval(intervalId);
    hideButton();
    showForm();
  }
}

function startCountDown() {
  intervalId = setInterval(editTimer, 1000);
}
async function getGameData(event) {
  try {
    const response = await fetch("/getData", {
      method: "GET",
    });
    const data = await response.json();
    renderTable(data);
  } catch (error) {
    // console.error(error.message);
  }
}

function renderTable(gameData) {
  let tblBody = document.querySelector("#leaderBoard tbody");
  tblBody.innerHTML = "";
  const sorted = [...gameData].sort((a, b) => b.score - a.score);

  sorted.forEach((entry, i) => {
    const row = document.createElement("tr");
    const rank = document.createElement("th");

    rank.setAttribute("scope", "row");
    rank.textContent = i + 1;
    row.append(rank);
  

  for (const key of ["score","cps","name", "date"]) {
    const cell = document.createElement("td");
    cell.textContent = entry[key];
    row.append(cell);
  }
      const actions = document.createElement("td");
    const del = document.createElement("button");
    del.textContent = "delete";
    del.className = "deleteBtn";

    del.addEventListener("click", async () => {
      await fetch("/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({
          name:  entry.name,
          score: entry.score,
          date:  entry.date
        })
      });
      getGameData();
    });

    actions.append(del);
    row.append(actions);
    tblBody.append(row);
  });
}

function endGame() {
  score = 0;
  time = 10;
  hasRun = false;
  hideForm();
  showInstruct();
}
button.addEventListener("click", () => {
  hideInstruct();
  score++;
  currentScore.textContent = `Score: ${score}`;

  if (!hasRun) {
    hasRun = true;
    startCountDown();
  }
});
sumbitScore.addEventListener("input", (event) => {
  event.preventDefault();
});

const submit = async function (event) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault();

  let currentDate = new Date();
  let gamedate = currentDate.toDateString();

  const input = document.getElementById("nameScore"),
    json = { score: score, name: input.value, date: gamedate },
    body = JSON.stringify(json);

  if (input === "") {
    console.log("Empty name");
  } else {
    const response = await fetch("/submit", {
      method: "POST",
       headers: { "Content-Type": "application/json" }, 
      body,
    });
    const text = await response.text();
    console.log("text:", text);
    endGame();
    getGameData();
  }
};

window.onload = function () {
  sumbitScore.onclick = submit;
  getGameData();
};

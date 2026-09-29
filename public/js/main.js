// FRONT-END (CLIENT) JAVASCRIPT HERE
// script.js
let score = 0;
let time = 10;
let hasRun = false;
let intervalId;
let currentUser = null;

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
async function getGameData() {
  try {
    const response = await fetch("/getData", {
      method: "GET",
    });
    const data = await response.json();
    console.log(data);
    renderTable(data);
  } catch (error) {
    console.error(error.message);
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

    let noteCell;
    for (const key of ["score", "name", "cps", "note", "date"]) {
      const cell = document.createElement("td");
      cell.textContent = entry[key];
      if (key === "note") noteCell = cell;
      row.append(cell);
    }
    const actions = document.createElement("td");

    if (currentUser && entry.name === currentUser.username) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "edit";
      editBtn.className = "editBtn";

      editBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.maxLength = 25;
        input.value = entry.note || "";
        noteCell.textContent = "";
        noteCell.append(input);
        input.focus();

        editBtn.textContent = "save";
        editBtn.onclick = async () => {
          await fetch("/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: entry._id, note: input.value }),
          });
          getGameData();
        };
      });

      actions.append(editBtn);

      const del = document.createElement("button");
      del.textContent = "delete";
      del.className = "deleteBtn";

      del.addEventListener("click", async () => {
        await fetch("/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: entry._id }),
        });
        getGameData();
      });

      actions.append(del);
    }
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

  const input = document.getElementById("userNote"),
    json = { score: score, name: currentUser.username,note: input.value, date: gamedate },
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

fetch("/me")
  .then((res) => res.json())
  .then((data) => {

    if(data.loggedIn){
      currentUser = data.user;
      document.getElementById("playerName").textContent = currentUser.username;
      document.getElementById("LoginScreen").style.display= "none";
      document.getElementById("gameScreen").style.display= "flex";
    }else{
      document.getElementById("LoginScreen").style.display= "block";
      document.getElementById("gameScreen").style.display= "none";
    }
  });

window.onload = function () {
  sumbitScore.onclick = submit;
  getGameData();
};

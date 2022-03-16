//allows us to access the canvas functions so we can draw shapes on the screen
const c = document.getElementById("canvas").getContext("2d");
//variables
let keysDown = {};

let strikes = 0.5;

let score = 0;

var cloud_highscore = 0;

let noiseVariable = 0.8;

playMode = "solo";

let currentlevel;
//creates the player and his attributes
const player = {
  x: 672,
  y: 256,
  width: 32,
  height: 32,
  speed: 3,
  mass: 64,
  yke: 0,
  gpe: 0
}
//calculates the gravitational potential energy of the player.
function calcGPE(obj) {
  return obj.mass * (9.8 / 1000000) * ((canvas.height - obj.height) - (obj.y / 32));
}
// creates the basic function for gravity and how it affects the player on the screen
function gravity(obj) {
  obj.y -= obj.yke;
  obj.yke -= obj.gpe;
  obj.gpe = calcGPE(obj);

  if (getTile(obj.x + 1, obj.y) !== "0" || getTile(obj.x + 31, obj.y) !== "0") {
    if (obj.yke >= 0) {
      obj.yke = -0.5;
      obj.y += 1;
    }
  } else {
    if (getTile(obj.x + 31, (obj.y + 32)) !== "0" || getTile(obj.x + 1, (obj.y + 32)) !== "0") {
      if (obj.yke <= 0) {
        obj.yke = 0;
        obj.y -= (obj.y % 32);
      }
    }
  }
}

//draws everything the internal computer constructs on the screen
function draw() {
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "green";
  c.fillRect(0, 0, 1344, 20);
  c.fillStyle = "blue";
  c.fillRect(player.x, player.y, player.width, player.height);
  c.fillStyle = "black";
  for (let row = 0; row < currentlevel.length; row++) {
    for (let col = 0; col < currentlevel[0].length; col++) {
      if (currentlevel[row][col] === "1") {
        c.fillRect(col * 32, row * 32, 32, 32);
      }
    }
  }
}
//construction plan for the level.
const level = `111111111111111111111111111111111111111111
100000000000000111111000011101000000000001
101000000000010000000000000000000001111111
100000000000111000001111000001011100000001
100011100000000000010001110000000000111111
100000000001111100000000000000011000000001
100100000000000000110110010011011110000001
100001000011111100000000000000000000001101
100000000001100011001111110011110000100001
111000001000000000000000000011000010000001
100000001000011111100000000000011110000001
100111111110000000100000100000000000000001
101000000000000000000011110000011111100001
100000000000000100000000000000000000000111
100000000111111111110000000000011110000001
111111111111111111111111111111111111111111`;
//generates random level
function randomLevel() {
  let l = [];
  const noise = noiseVariable;
  for (let i = 0; i < 17; i++) {
    l.push([]);
    l[i].push(...("0".repeat(42).split("")));
    for (let j = 0; j < 42; j++) {
      const random = Math.random();
      if (random > noise) {
        l[i][j] = "1";
      }
    }
  }
  return l;
}
//groups the 0s and 1s of the level above into a state the code can organize.
function parse(lvl) {
  const lines = lvl.split("\n");
  const characters = lines.map(l => l.split(""));
  return characters;
}
//saves keys to keysDown when the key is pressed
addEventListener("keydown", function (event) {
  keysDown[event.keyCode] = true;
})
//deletes keys in keysDown when the key is released
addEventListener("keyup", function (event) {
  delete keysDown[event.keyCode];
});
// gathers all the inputs from keysDown.
function input() {
  if (37 in keysDown) {
    if (getTile((player.x - player.speed) + 1, player.y + 16) !== "1")
      player.x -= player.speed;
  }
  if (39 in keysDown) {
    if (getTile(((player.x + player.width) + player.speed) - 1, player.y + 16) !== "1") {
      player.x += player.speed;
    }
  }
  if (40 in keysDown) {
    player.y += 3;
    player.height = 29;
    player.speed = 1;
    console.log(getTile(player.x, player.y))
  }
  if (!(40 in keysDown)) {
    player.height = 32;
    player.speed = 3;
  }
  if (38 in keysDown && player.yke === 0) {
    if (getTile(player.x + 1, player.y - 1) !== "1" && getTile(player.x + 31, player.y - 1) !== "1") {
      player.yke += 8;
    }
  }
  if (13 in keysDown) {
    if (player.yke == 0) {
      resetLevel();
    }
  }
  if (83 in keysDown) {
    alert("Your score is " + score);
    keysDown = [];
  }
  if (72 in keysDown) {
    alert("Highscore " + cloud_highscore);
    keysDown = [];
  }
  if (78 in keysDown) {
    alert("noise level is " + noiseVariable);
    keysDown = [];
  }
}
// function to check if a block is in the players way
function getTile(x, y) {
  return (currentlevel[Math.floor(y / 32)][Math.floor(x / 32)]);
}
//checks if the player has gotten to the green strip
function winCheck() {
  if (player.y <= 20) {
    keysDown = [];
    player.yke = 0;
    score++;
    if (score > cloud_highscore) {
      cloud_highscore = score;
    }
    if (noiseVariable < 0.93) {
      noiseVariable = 0.8 + (score * 0.01);
    }
    resetLevel();
    alert("Well done! Your score is " + score + ". Want to play again?");
  }
}
//checks if the player has fallen into the abyss
function loseCheck() {
  if (player.y >= 479) {
    strikes += 0.5
    if (strikes == 1) {
      keysDown = [];
      player.x = 672;
      player.y = 256;
      strikes += 0.5;
      alert("That's okay; you still got 2 more chances.");
    }
    if (strikes == 2) {
      keysDown = [];
      player.x = 672;
      player.y = 256;
      strikes += 0.5;
      alert("Uh oh; well, try one more time. You can do it!");
    }
    if (strikes == 3) {
      keysDown = [];
      player.x = 672;
      player.y = 256;
      strikes = 0.5
      noiseVariable = 0.8;
      resetLevel();
      if (score <= cloud_highscore) {
        alert("Oh well; better luck next time. Your score was " + score + ". So close! Want to play again?");
      }
      if (score > cloud_highscore) {
        cloud_highscore = score;
        alert("Oh well; better luck next time. Your score was " + score + ". You beat the highscore! Want to play again?");
      }
      score = 0
    }
  }
}
//a function that resets the page and creates a new level
function resetLevel() {
  player.x = 672;
  player.y = 256;
  currentlevel = randomLevel();
  currentlevel[9][21] = "1";
  currentlevel[8][21] = "0";
  currentlevel[8][20] = "0";
  currentlevel[8][22] = "0";
}
// main function, gets the inputs, draws the frames, then repeats itself.
function main() {
  gravity(player);
  input();
  draw();
  winCheck();
  loseCheck();
  requestAnimationFrame(main);
}
//calls the function to construct the level, initiates the main function all when the page is loaded.
window.onload = function () {
  currentlevel = randomLevel();
  currentlevel[9][21] = "1";
  currentlevel[8][21] = "0";
  currentlevel[8][20] = "0";
  currentlevel[8][22] = "0";
  main();
  alert("Welcome to Par-Kube!");
  alert("Use the arrow keys to move. The goal is to get to the green strip at the top without falling. If you want to see your score in progress, press 's'. To see your highscore, press 'h'. In case there's a bug or a completely impossible level pops up, press the 'enter' button to reset the level. Good luck!");
  alert("Highscore " + cloud_highscore);
}
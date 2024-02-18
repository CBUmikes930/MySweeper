let difficulty_mapping = {
    "easy": {
        "rows": 9,
        "cols": 9,
        "mines": 10
    },
    "medium": {
        "rows": 16,
        "cols": 16,
        "mines": 40
    },
    "hard": {
        "rows": 16,
        "cols": 30,
        "mines": 99
    }
}

let game_data = []
let num_remaining_mines = 0
let num_remaining_cells = 0
let start_time
let timer_interval

function difficultyChanged() {
    // Get the selected difficulty from the dropdown value
    let difficulty = document.getElementById("difficulty").value
    document.getElementById("custom_params").style.visibility = (difficulty == "custom") ? "visible" : "hidden"
}

function newGame() {
    // Get the selected difficulty from the dropdown value
    let difficulty = document.getElementById("difficulty").value

    if (difficulty == "custom") {
        difficulty_mapping["current"] = {
            "rows": document.getElementById("rows").value,
            "cols": document.getElementById("cols").value,
            "mines": document.getElementById("mines").value
        }
    } else {
        difficulty_mapping["current"] = difficulty_mapping[difficulty]
    }

    // Get the game board (table) element
    let game_board = document.getElementById("game_board")
    // Clear the previous gameboard
    game_board.innerHTML = ''
    game_data = []
    // For the selected number of rows/cols
    for (let i = 0; i < difficulty_mapping["current"].rows; i++) {
        // Create a new row
        row = document.createElement("tr")
        game_data[i] = []
        for (let j = 0; j < difficulty_mapping["current"].cols; j++) {
            // Create a new cell
            col = document.createElement("td")
            // Assign an ID with the given grid coords
            col.setAttribute("id", j + "-" + i)
            // Add the left and right click listeners
            col.addEventListener("click", function() {
                clickCell(this)
            })
            col.addEventListener('contextmenu', function(ev) {
                ev.preventDefault();
                flagCell(this)
                return false;
            }, false);
            // Add the new cell to the row
            row.appendChild(col)
            game_data[i][j] = {
                mine: false,
                nearby: 0,
                checked: false,
                flagged: false
            }
        }
        // Add the new row to the game board
        game_board.appendChild(row)
    }

    // For the number of mines
    for (let i = 0; i < difficulty_mapping["current"].mines; i++) {
        // Pick a random cell
        let x = Math.floor(Math.random() * difficulty_mapping["current"].rows)
        let y = Math.floor(Math.random() * difficulty_mapping["current"].cols)

        // If the cell is already a mine
        if (game_data[x][y].mine) {
            // Pick another cell
            i--
        } else {
            // Make the cell a mine
            game_data[x][y].mine = true
            // Add the mine to the nearby counters of all surrounding cells
            for (let j = Math.max(x - 1, 0); j <= Math.min(x + 1, difficulty_mapping["current"].rows - 1); j++) {
                for (let k = Math.max(y - 1, 0); k <= Math.min(y + 1, difficulty_mapping["current"].cols - 1); k++) {
                    game_data[j][k].nearby++
                }
            }
        }
    }
    num_remaining_mines = difficulty_mapping["current"].mines
    document.getElementById("mine_count").innerHTML = "Mines Remaining: " + num_remaining_mines
    num_remaining_cells = difficulty_mapping["current"].rows * difficulty_mapping["current"].cols

    start_time = new Date().getTime()
    timer_interval = setInterval(timer, 1000)
}

function clickCell(target) {
    if (timer_interval == undefined) {
        return
    }
    // Get the coords from the object id
    let coords = target.id.split("-")
    // If the selected cell was flagged, don't allow click
    if (game_data[coords[1]][coords[0]].flagged) {
        alert("You cannot click on a flagged cell.")
        return
    }
    // If the selected cell was a mine
    if (game_data[coords[1]][coords[0]].mine) {
        // Show all mine cells as red
        for (let i = 0; i < game_data.length; i++) {
            for (let j = 0; j < game_data[i].length; j++) {
                if (game_data[i][j].mine) {
                    document.getElementById(j + "-" + i).classList.add("mine")
                }
            }
        }
        setTimeout(function () {
            clearInterval(timer_interval)
            timer_interval = undefined
            alert("Game Over!")
        }, 250)
    } else {
        // Show nearby values of the selected cell
        showNearbyValues(coords[1], coords[0])
    }
    if (num_remaining_cells == difficulty_mapping["current"].mines) {
        setTimeout(function () {
            clearInterval(timer_interval)
            timer_interval = undefined
            alert("You Win!")
        }, 250)
    }
}

function flagCell(target) {
    if (timer_interval == undefined) {
        return
    }
    // Get the coords from the object id
    let coords = target.id.split("-")
    // If the target cell has already been checked, then don't flag
    if (game_data[coords[1]][coords[0]].checked) {
        return
    }
    // If the target cell has been flagged, then un-flag it
    if (game_data[coords[1]][coords[0]].flagged) {
        game_data[coords[1]][coords[0]].flagged = false
        target.classList.remove("flagged")
        document.getElementById("mine_count").innerHTML = "Mines Remaining: " + ++num_remaining_mines
    } else {
        // If the target cell has not been flagged, then flag it
        game_data[coords[1]][coords[0]].flagged = true
        target.classList.add("flagged")
        document.getElementById("mine_count").innerHTML = "Mines Remaining: " + --num_remaining_mines
    }
}

function showNearbyValues(x, y, path) {
    // If the cell has already been checked or is a mine
    if (game_data[x][y].checked || game_data[x][y].mine) {
        return
    } else {
        // Flag the cell as having been checked
        game_data[x][y].checked = true
        num_remaining_cells--
    }
    // Change the background and border color
    target = document.getElementById(y + "-" + x)
    target.classList.add("checked")

    // Get the count of nearby mines
    let nearby = game_data[x][y].nearby
    if (nearby > 0) {
        // Show the amount of mines nearby if more than 0
        target.innerHTML = nearby
        target.classList.add("color-" + nearby)
    } else {
        // Recurse around and show the amount of mines of connected cells
        for (let i = Math.max(parseInt(x) - 1, 0); i <= Math.min(parseInt(x) + 1, difficulty_mapping["current"].rows - 1); i++) {
            for (let j = Math.max(parseInt(y) - 1, 0); j <= Math.min(parseInt(y) + 1, difficulty_mapping["current"].cols - 1); j++) {
                showNearbyValues(i, j)
            }
        }
    }
}

function timer() {
    // Get current date and time
    var now = new Date().getTime()
  
    // Find the distance between now and the start time
    var distance = now - start_time
  
    // Time calculations for minutes and seconds
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    var seconds = Math.floor((distance % (1000 * 60)) / 1000)
  
    // Display the result in the element with id="demo"
    document.getElementById("timer").innerHTML = "Time: " + ("00" + minutes).slice(-2) + ":" + ("00" + seconds).slice(-2)
  }
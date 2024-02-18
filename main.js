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

function newGame() {
    // Get the selected difficulty from the dropdown value
    let difficulty = document.getElementById("difficulty").value
    // Get the game board (table) element
    let game_board = document.getElementById("game_board")
    // Clear the previous gameboard
    game_board.innerHTML = ''
    game_data = []
    // For the selected number of rows/cols
    for (let i = 0; i < difficulty_mapping[difficulty].rows; i++) {
        // Create a new row
        row = document.createElement("tr")
        game_data[i] = []
        for (let j = 0; j < difficulty_mapping[difficulty].cols; j++) {
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
    for (let i = 0; i < difficulty_mapping[difficulty].mines; i++) {
        // Pick a random cell
        let x = Math.floor(Math.random() * difficulty_mapping[difficulty].rows)
        let y = Math.floor(Math.random() * difficulty_mapping[difficulty].cols)

        // If the cell is already a mine
        if (game_data[x][y].mine) {
            // Pick another cell
            i--
        } else {
            // Make the cell a mine
            game_data[x][y].mine = true
            // Add the mine to the nearby counters of all surrounding cells
            for (let j = Math.max(x - 1, 0); j <= Math.min(x + 1, difficulty_mapping[difficulty].rows - 1); j++) {
                for (let k = Math.max(y - 1, 0); k <= Math.min(y + 1, difficulty_mapping[difficulty].cols - 1); k++) {
                    game_data[j][k].nearby++
                }
            }
        }
    }
    num_remaining_mines = difficulty_mapping[difficulty].mines
    document.getElementById("mine_count").innerHTML = "Mines Remaining: " + num_remaining_mines
    num_remaining_cells = difficulty_mapping[difficulty].rows * difficulty_mapping[difficulty].cols
}

function showValues() {
    // Get the selected difficulty from the dropdown value
    let difficulty = document.getElementById("difficulty").value
    // For every cell
    for (let i = 0; i < difficulty_mapping[difficulty].rows; i++) {
        for (let j = 0; j < difficulty_mapping[difficulty].cols; j++) {
            let cell = document.getElementById(j + "-" + i)
            // If the cell is a mine, color it red
            if (game_data[i][j].mine) {
                cell.classList.add("mine")
            } else {
                // Otherwise, show the nearby number
                cell.innerHTML = game_data[i][j].nearby
            }
        }
    }
}

function clickCell(target) {
    // Get the selected difficulty from the dropdown value
    let difficulty = document.getElementById("difficulty").value

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
    } else {
        // Show nearby values of the selected cell
        showNearbyValues(coords[1], coords[0])
    }
    if (num_remaining_cells == difficulty_mapping[difficulty].mines) {
        alert("You win!")
    }
}

function flagCell(target) {
    // Get the coords from the object id
    let coords = target.id.split("-")
    if (game_data[coords[1]][coords[0]].checked) {
        return
    }
    if (game_data[coords[1]][coords[0]].flagged) {
        game_data[coords[1]][coords[0]].flagged = false
        target.classList.remove("flagged")
        document.getElementById("mine_count").innerHTML = "Mines Remaining: " + ++num_remaining_mines
    } else {
        game_data[coords[1]][coords[0]].flagged = true
        target.classList.add("flagged")
        document.getElementById("mine_count").innerHTML = "Mines Remaining: " + --num_remaining_mines
    }
}

function showNearbyValues(x, y) {
    // If the cell has already been checked or is a mine
    if (game_data[x][y].checked || game_data[x][y].mine) {
        return
    } else {
        // Flag the cell as having been checked
        game_data[x][y].checked = true
        num_remaining_cells--
    }

    // Get the selected difficulty from the dropdown value
    let difficulty = document.getElementById("difficulty").value
    // Change the background and border color
    target = document.getElementById(y + "-" + x)
    target.classList.add("checked")

    // Get the count of nearby mines
    let nearby = game_data[x][y].nearby
    if (nearby > 0) {
        // Show the amount of mines nearby if more than 0
        target.innerHTML = nearby
    } else {
        // Recurse around and show the amount of mines of connected cells
        for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, difficulty_mapping[difficulty].rows - 1); i++) {
            for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, difficulty_mapping[difficulty].cols - 1); j++) {
                showNearbyValues(i, j)
            }
        }
    }
}
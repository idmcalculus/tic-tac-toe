<template>
  <div id="app">
    <!-- Display either the next-player status or the winner/tie message -->
    <div class="status">{{ status }}</div>
    
    <!-- Reset button -->
    <button class="reset" @click="resetGame">Reset</button>
    
    <!-- 3x3 board -->
    <template v-for="row in 3" :key="row">
      <div class="row">
        <button
          v-for="button in 3"
          :key="button"
          class="square"
          :data-value="board[row - 1][button - 1]"
          @click="makeMove(row - 1, button - 1)"
        >
          {{ board[row - 1][button - 1] }}
        </button>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      // 3×3 board. Each cell holds "", "X", or "O".
      board: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      currentPlayer: "X",
      status: "Next player: X",
      gameOver: false,
    };
  },
  methods: {
    // Called whenever a square is clicked
    makeMove(rowIndex, colIndex) {
      // Ignore if the game is over or the square is already occupied
      if (this.gameOver || this.board[rowIndex][colIndex] !== "") return;

      // Place the current player's mark
      this.board[rowIndex][colIndex] = this.currentPlayer;

      // Check for a winner
      if (this.checkWin(this.currentPlayer)) {
        this.status = `Player ${this.currentPlayer} wins!`;
        this.gameOver = true;
      }
      // Or check for a tie (no empty cells, no winner)
      else if (this.checkTie()) {
        this.status = "It's a tie!";
        this.gameOver = true;
      }
      // Otherwise switch players
      else {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        this.status = `Next player: ${this.currentPlayer}`;
      }
    },

    // Checks if the specified player has 3 in a row
    checkWin(player) {
      // Check rows
      for (let r = 0; r < 3; r++) {
        if (
          this.board[r][0] === player &&
          this.board[r][1] === player &&
          this.board[r][2] === player
        ) {
          return true;
        }
      }
      // Check columns
      for (let c = 0; c < 3; c++) {
        if (
          this.board[0][c] === player &&
          this.board[1][c] === player &&
          this.board[2][c] === player
        ) {
          return true;
        }
      }
      // Check diagonals
      if (
        this.board[0][0] === player &&
        this.board[1][1] === player &&
        this.board[2][2] === player
      ) {
        return true;
      }
      if (
        this.board[0][2] === player &&
        this.board[1][1] === player &&
        this.board[2][0] === player
      ) {
        return true;
      }
      return false;
    },

    // Checks if the game will end in a tie
    checkTie() {
      // 1. Collect all empty cells
      const emptyCells = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.board[r][c] === "") {
            emptyCells.push([r, c]);
          }
        }
      }
      
      // 2. If more than 2 empty cells, we can't guarantee a tie yet
      if (emptyCells.length > 2) {
        return false;
      }

      // 3. If no empty cells, it's definitely a tie (no winner found so far)
      if (emptyCells.length === 0) {
        return true;
      }

      // 4. If exactly 1 empty cell, do the one-move look-ahead
      if (emptyCells.length === 1) {
        const [r, c] = emptyCells[0];
        // Try current player's move
        this.board[r][c] = this.currentPlayer;
        const canWin = this.checkWin(this.currentPlayer);
        // Undo move
        this.board[r][c] = "";

        // If current player can win by taking this last cell, not a tie
        return !canWin;
      }

      // 5. If exactly 2 empty cells, we do a 2-move look-ahead:
      if (emptyCells.length === 2) {
        // label them for convenience
        const [r1, c1] = emptyCells[0];
        const [r2, c2] = emptyCells[1];

        // We'll try all possible scenarios of the next two moves:
        //    currentPlayer -> otherPlayer
        //    currentPlayer -> otherPlayer
        // across both empty cells

        const otherPlayer = this.currentPlayer === "X" ? "O" : "X";

        // Helper function to test a scenario:
        // Place the current player in cellA, check win,
        //   if not a win, place the other player in cellB, check win
        // Return true if neither move leads to a win.
        const testScenario = (cellA, cellB) => {
          // First move: current player
          this.board[cellA[0]][cellA[1]] = this.currentPlayer;
          let winFirstMove = this.checkWin(this.currentPlayer);

          if (!winFirstMove) {
            // Second move: other player
            this.board[cellB[0]][cellB[1]] = otherPlayer;
            let winSecondMove = this.checkWin(otherPlayer);
            // Revert second move
            this.board[cellB[0]][cellB[1]] = "";
            
            // Revert first move
            this.board[cellA[0]][cellA[1]] = "";
            
            // If second move is also not a win, scenario is “no immediate winner”
            return !winFirstMove && !winSecondMove;
          } else {
            // Revert first move if it was a winning scenario
            this.board[cellA[0]][cellA[1]] = "";
            return false; 
          }
        };

        // Scenario A: (r1,c1) -> currentPlayer, (r2,c2) -> otherPlayer
        const scenarioA = testScenario([r1, c1], [r2, c2]);

        // Scenario B: (r2,c2) -> currentPlayer, (r1,c1) -> otherPlayer
        const scenarioB = testScenario([r2, c2], [r1, c1]);

        // If in *both* scenarios there's no winner after two moves,
        // then we can call it a tie. If either scenario leads to a win,
        // that means a tie is not guaranteed.
        return scenarioA && scenarioB;
      }

      // Fallback (should not happen logically, but just in case):
      return false;
    },

    // Reset the board and status
    resetGame() {
      this.board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ];
      this.currentPlayer = "X";
      this.status = "Next player: X";
      this.gameOver = false;
    },
  },
};
</script>

<style scoped>
.row {
  margin-bottom: 5px;
  display: flex;
}

.square {
  margin-right: 5px;
  font-size: 1.5rem;
  width: 60px !important;
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ccc;
  background: white;
  cursor: pointer;
  font-weight: bold;
}

/* Style for X */
.square:not(:empty) {
  color: #2196F3;
}

/* Style specifically for O */
.square:not(:empty)[data-value="O"] {
  color: #FF5722;
}

.square:hover {
  background: #f5f5f5;
}

.status {
  font-size: 1.5rem;
  margin-bottom: 15px;
  padding: 10px;
  font-weight: bold;
  color: #333;
}

button.reset {
  margin-bottom: 20px;
  padding: 8px 24px;
  font-size: 1rem;
  cursor: pointer;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background 0.2s;
}

button.reset:hover {
  background: #45a049;
}

#app {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
}
</style>
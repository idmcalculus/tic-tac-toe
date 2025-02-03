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
			// Store the indices of the winning squares
			winningCells: [],
			// Store the row/col index of the most recently updated cell for animation
			recentlyUpdatedCell: [-1, -1],
		};
	},
	methods: {
		// Called whenever a square is clicked
		makeMove(rowIndex, colIndex) {
			// Ignore if the game is over or the square is already occupied
			if (this.gameOver || this.board[rowIndex][colIndex] !== "") return;
	
			// Place the current player's mark
			this.board[rowIndex][colIndex] = this.currentPlayer;
	
			// Mark the newly updated cell for the "placed" animation
			this.recentlyUpdatedCell = [rowIndex, colIndex];
	
			// Check for a winner with the real checkWin (which can set winningCells)
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
  
		// Checks if the specified player has 3 in a row (REAL check)
		checkWin(player) {
			// Always clear winningCells before checking
			this.winningCells = [];
	
			// Check rows
			for (let r = 0; r < 3; r++) {
			if (
				this.board[r][0] === player &&
				this.board[r][1] === player &&
				this.board[r][2] === player
			) {
				this.winningCells = [[r, 0], [r, 1], [r, 2]];
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
				this.winningCells = [[0, c], [1, c], [2, c]];
				return true;
			}
			}
			// Check diagonals
			if (
				this.board[0][0] === player &&
				this.board[1][1] === player &&
				this.board[2][2] === player
			) {
				this.winningCells = [[0, 0], [1, 1], [2, 2]];
				return true;
			}
			if (
				this.board[0][2] === player &&
				this.board[1][1] === player &&
				this.board[2][0] === player
			) {
				this.winningCells = [[0, 2], [1, 1], [2, 0]];
				return true;
			}
			return false;
		},
  
		// A "no-record" version of checkWin, for tie look-ahead only
		// This method will NOT set this.winningCells. It just returns true/false.
		checkWinNoRecord(player) {
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
  
		// Checks if the game will end in a tie (using "no-record" win checks)
		checkTie() {
			const emptyCells = [];

			for (let r = 0; r < 3; r++) {
				for (let c = 0; c < 3; c++) {
					if (this.board[r][c] === "") {
						emptyCells.push([r, c]);
					}
				}
			}
	
			// If the board has no empty cells, it's definitely a tie
			if (emptyCells.length === 0) {
				return true;
			}
	
			// If you want classic Tic-Tac-Toe, you'd simply return false here 
			// because we usually only declare a tie if the board is full.
	
			// If more than 2 empty cells remain, can't guarantee a tie
			if (emptyCells.length > 2) {
				return false;
			}
	
			// If exactly 1 empty cell, see if the current player can win immediately
			if (emptyCells.length === 1) {
				const [r, c] = emptyCells[0];
				this.board[r][c] = this.currentPlayer;
				const canWin = this.checkWinNoRecord(this.currentPlayer);
				this.board[r][c] = "";
				return !canWin; // if they can win, not a tie
			}
	
			// If exactly 2 empty cells, do a 2-move look-ahead
			if (emptyCells.length === 2) {
				const [r1, c1] = emptyCells[0];
				const [r2, c2] = emptyCells[1];
				const otherPlayer = this.currentPlayer === "X" ? "O" : "X";
		
				const testScenario = (cellA, cellB) => {
					// First move: current player
					this.board[cellA[0]][cellA[1]] = this.currentPlayer;
					let winFirstMove = this.checkWinNoRecord(this.currentPlayer);
		
					if (!winFirstMove) {
						// Second move: other player
						this.board[cellB[0]][cellB[1]] = otherPlayer;
						let winSecondMove = this.checkWinNoRecord(otherPlayer);
			
						// Revert
						this.board[cellB[0]][cellB[1]] = "";
						this.board[cellA[0]][cellA[1]] = "";
			
						return !winSecondMove;
					} else {
						// Revert first move
						this.board[cellA[0]][cellA[1]] = "";
						return false;
					}
				};
		
				const scenarioA = testScenario([r1, c1], [r2, c2]);
				const scenarioB = testScenario([r2, c2], [r1, c1]);
				return scenarioA && scenarioB;
			}
	
			return false;
		},
  
		// Helper to see if a cell is in the winning combo
		isWinningCell(r, c) {
			return this.winningCells.some(
				([winR, winC]) => winR === r && winC === c
			);
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
			this.winningCells = [];
			this.recentlyUpdatedCell = [-1, -1];
		},
	},
};
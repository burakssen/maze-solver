import { Cell } from "./types";

class GridManager {
    private grid: Cell[][];
    private rows: number;
    private cols: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createGrid();
        this.generateMaze(); // Generate initial maze
    }

    get currentGrid(): Cell[][] {
        return this.grid;
    }

    get gridSize(): [number, number] {
        return [this.rows, this.cols];
    }

    regenerate(): void {
        this.grid = this.createGrid();
        this.generateMaze();
        this.clearAnimationState();
    }

    private createGrid(): Cell[][] {
        return Array.from({ length: this.rows }, () =>
            Array.from({ length: this.cols }, () => ({
                rightWall: true,
                bottomWall: true,
                visited: false,
                isStart: false,
                isEnd: false,
                isExplored: false,
                isPath: false
            }))
        ).map((row, rowIndex) =>
            row.map((cell, colIndex) => ({
                ...cell,
                isStart: rowIndex === 0 && colIndex === 0,
                isEnd: rowIndex === this.rows - 1 && colIndex === this.cols - 1
            }))
        );
    }

    generateMaze(): void {
        // Reset visited state for maze generation
        this.grid.forEach(row => row.forEach(cell => cell.visited = false));
        this.generateMazeRecursive(0, 0);
    }

    private generateMazeRecursive(row: number, col: number): void {
        const directions = [
            { dr: -1, dc: 0, wall: "top" },    // Up
            { dr: 1, dc: 0, wall: "bottom" },  // Down
            { dr: 0, dc: -1, wall: "left" },   // Left
            { dr: 0, dc: 1, wall: "right" }    // Right
        ];

        // Mark current cell as visited
        this.grid[row][col].visited = true;

        // Shuffle directions randomly
        this.shuffle(directions);

        // Try each direction
        for (const { dr, dc, wall } of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            // Check if the new cell is valid and unvisited
            if (this.isValidCell(newRow, newCol) && !this.grid[newRow][newCol].visited) {
                // Remove walls between current cell and next cell
                switch (wall) {
                    case "top":
                        this.grid[newRow][newCol].bottomWall = false;
                        break;
                    case "bottom":
                        this.grid[row][col].bottomWall = false;
                        break;
                    case "left":
                        this.grid[newRow][newCol].rightWall = false;
                        break;
                    case "right":
                        this.grid[row][col].rightWall = false;
                        break;
                }

                // Recursively visit the next cell
                this.generateMazeRecursive(newRow, newCol);
            }
        }
    }

    clearAnimationState(): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].isExplored = false;
                this.grid[row][col].isPath = false;
                this.grid[row][col].visited = false;
            }
        }
    }

    private isValidCell(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    private shuffle<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

export { GridManager };
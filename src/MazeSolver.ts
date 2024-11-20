import { Cell, PathfindingAlgorithm } from './types';
import { MazeRenderer } from './MazeRenderer';

// Maze Solver Class
class MazeSolver {
    private grid: Cell[][];
    private rows: number;
    private cols: number;
    private startCell: [number, number] = [0, 0];
    private endCell: [number, number];
    private renderer: MazeRenderer;
    private animationSpeed: number;

    constructor(grid: Cell[][], renderer: MazeRenderer, speed: number) {
        this.grid = grid;
        this.rows = grid.length;
        this.cols = grid[0].length;
        this.endCell = [this.rows - 1, this.cols - 1];
        this.renderer = renderer;
        this.animationSpeed = speed;
    }

    setSpeed(speed: number): void {
        this.animationSpeed = speed;
    }

    private async updateCell(row: number, col: number, isPath: boolean = false): Promise<void> {
        this.grid[row][col].isExplored = true;
        if (isPath) this.grid[row][col].isPath = true;
        this.renderer.drawGrid(this.grid);
        await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
    }

    async solveBFS(): Promise<[number, number][]> {
        const queue: [number, number][] = [this.startCell];
        const visited = new Set<string>();
        const parent = new Map<string, [number, number]>();

        visited.add(this.coordToKey(this.startCell));
        await this.updateCell(this.startCell[0], this.startCell[1]);

        while (queue.length > 0) {
            const current = queue.shift()!;
            const [row, col] = current;

            if (row === this.endCell[0] && col === this.endCell[1]) {
                return this.reconstructPath(parent, current);
            }

            const neighbors = this.getValidNeighbors(row, col);
            for (const [nextRow, nextCol] of neighbors) {
                const key = this.coordToKey([nextRow, nextCol]);
                if (!visited.has(key)) {
                    visited.add(key);
                    parent.set(key, current);
                    queue.push([nextRow, nextCol]);
                    await this.updateCell(nextRow, nextCol);
                }
            }
        }

        return [];
    }

    async solveDFS(): Promise<[number, number][]> {
        const visited = new Set<string>();
        const parent = new Map<string, [number, number]>();

        const dfs = async (current: [number, number]): Promise<boolean> => {
            const [row, col] = current;
            const key = this.coordToKey(current);

            if (visited.has(key)) return false;
            visited.add(key);

            await this.updateCell(row, col);

            if (row === this.endCell[0] && col === this.endCell[1]) {
                return true;
            }

            const neighbors = this.getValidNeighbors(row, col);
            for (const next of neighbors) {
                const nextKey = this.coordToKey(next);
                if (!visited.has(nextKey)) {
                    parent.set(nextKey, current);
                    if (await dfs(next)) {
                        return true;
                    }
                }
            }

            return false;
        };

        await dfs(this.startCell);
        return this.reconstructPath(parent, this.endCell);
    }

    async solveAStar(): Promise<[number, number][]> {
        const openSet = new Set<string>([this.coordToKey(this.startCell)]);
        const closedSet = new Set<string>();
        const parent = new Map<string, [number, number]>();

        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();

        gScore.set(this.coordToKey(this.startCell), 0);
        fScore.set(this.coordToKey(this.startCell), this.heuristic(this.startCell));
        await this.updateCell(this.startCell[0], this.startCell[1]);

        while (openSet.size > 0) {
            let current = this.getLowestFScore(openSet, fScore);
            const [row, col] = current;

            if (row === this.endCell[0] && col === this.endCell[1]) {
                return this.reconstructPath(parent, current);
            }

            openSet.delete(this.coordToKey(current));
            closedSet.add(this.coordToKey(current));
            await this.updateCell(row, col);

            const neighbors = this.getValidNeighbors(row, col);
            for (const neighbor of neighbors) {
                const neighborKey = this.coordToKey(neighbor);
                if (closedSet.has(neighborKey)) continue;

                const tentativeGScore = gScore.get(this.coordToKey(current))! + 1;

                if (!openSet.has(neighborKey)) {
                    openSet.add(neighborKey);
                    await this.updateCell(neighbor[0], neighbor[1]);
                } else if (tentativeGScore >= gScore.get(neighborKey)!) {
                    continue;
                }

                parent.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor));
            }
        }

        return [];
    }

    async solve(algorithm: PathfindingAlgorithm): Promise<[number, number][]> {
        // Clear previous solution
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].isExplored = false;
                this.grid[row][col].isPath = false;
            }
        }
        this.renderer.drawGrid(this.grid);

        switch (algorithm.toLowerCase()) {
            case 'bfs':
                return this.solveBFS();
            case 'dfs':
                return this.solveDFS();
            case 'astar':
                return this.solveAStar();
            default:
                return [];
        }
    }

    private async visualizePath(path: [number, number][]): Promise<void> {
        for (const [row, col] of path) {
            await this.updateCell(row, col, true);
        }
    }

    private async reconstructPath(parent: Map<string, [number, number]>, current: [number, number]): Promise<[number, number][]> {
        const path: [number, number][] = [current];
        let currentKey = this.coordToKey(current);

        while (parent.has(currentKey)) {
            current = parent.get(currentKey)!;
            currentKey = this.coordToKey(current);
            path.unshift(current);
        }

        await this.visualizePath(path);
        return path;
    }

    private getValidNeighbors(row: number, col: number): [number, number][] {
        const neighbors: [number, number][] = [];
        const directions = [
            [-1, 0], // Up
            [1, 0],  // Down
            [0, -1], // Left
            [0, 1]   // Right
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (this.isValidCell(newRow, newCol)) {
                // Check walls
                if (dr === -1 && row > 0 && !this.grid[newRow][newCol].bottomWall) neighbors.push([newRow, newCol]);
                if (dr === 1 && !this.grid[row][col].bottomWall) neighbors.push([newRow, newCol]);
                if (dc === -1 && col > 0 && !this.grid[newRow][newCol].rightWall) neighbors.push([newRow, newCol]);
                if (dc === 1 && !this.grid[row][col].rightWall) neighbors.push([newRow, newCol]);
            }
        }

        return neighbors;
    }

    private heuristic(cell: [number, number]): number {
        return Math.abs(cell[0] - this.endCell[0]) + Math.abs(cell[1] - this.endCell[1]);
    }

    private getLowestFScore(openSet: Set<string>, fScore: Map<string, number>): [number, number] {
        let lowest = Infinity;
        let lowestCell: [number, number] | null = null;

        for (const key of openSet) {
            const score = fScore.get(key) || Infinity;
            if (score < lowest) {
                lowest = score;
                lowestCell = this.keyToCoord(key);
            }
        }

        return lowestCell!;
    }

    private isValidCell(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    private coordToKey(coord: [number, number]): string {
        return `${coord[0]},${coord[1]}`;
    }

    private keyToCoord(key: string): [number, number] {
        const [row, col] = key.split(',').map(Number);
        return [row, col];
    }
}

export { MazeSolver };
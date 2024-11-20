import { PathfindingAlgorithm } from './types';

import { GridManager } from './GridManaget';
import { MazeRenderer } from './MazeRenderer';
import { MazeSolver } from './MazeSolver';


// UI Controller Class
class MazeController {
    private gridManager: GridManager;
    private renderer: MazeRenderer;
    private solver: MazeSolver;
    private speedSlider: HTMLInputElement;
    private speedValue: HTMLSpanElement;

    constructor(
        canvas: HTMLCanvasElement,
        private rowSlider: HTMLInputElement,
        private colSlider: HTMLInputElement,
        private rowValue: HTMLSpanElement,
        private colValue: HTMLSpanElement,
        private regenerateButton: HTMLButtonElement,
        private solveButton: HTMLButtonElement,
        private algorithmSelect: HTMLSelectElement
    ) {
        this.speedSlider = document.getElementById('speedSlider') as HTMLInputElement;
        this.speedValue = document.getElementById('speedValue') as HTMLSpanElement;

        if (!this.speedSlider || !this.speedValue) {
            throw new Error('Speed control elements not found');
        }

        // Initialize with default values
        const initialRows = parseInt(rowSlider.value, 10);
        const initialCols = parseInt(colSlider.value, 10);
        const initialSpeed = parseInt(this.speedSlider.value, 10);

        this.gridManager = new GridManager(initialRows, initialCols);
        this.renderer = new MazeRenderer(canvas);
        this.solver = new MazeSolver(this.gridManager.currentGrid, this.renderer, initialSpeed);

        this.setupEventListeners();
        this.initialize();

        // Handle window resize
        window.addEventListener('resize', () => {
            const [rows, cols] = this.gridManager.gridSize;
            this.renderer.resizeCanvas(cols, rows);
            this.renderer.drawGrid(this.gridManager.currentGrid);
        });
    }

    private initialize(): void {
        const [rows, cols] = this.gridManager.gridSize;
        this.renderer.resizeCanvas(cols, rows);
        this.renderer.drawGrid(this.gridManager.currentGrid);
    }

    private setupEventListeners(): void {
        this.rowSlider.addEventListener("input", () => {
            this.handleSliderChange();
            this.rowValue.textContent = this.rowSlider.value;
        });

        this.colSlider.addEventListener("input", () => {
            this.handleSliderChange();
            this.colValue.textContent = this.colSlider.value;
        });

        this.speedSlider.addEventListener("input", () => {
            const speed = parseInt(this.speedSlider.value, 10);
            this.speedValue.textContent = `${speed}ms`;
            if (this.solver) {
                this.solver.setSpeed(speed);
            }
        });

        this.regenerateButton.addEventListener("click", () => {
            this.regenerateGrid();
        });

        this.solveButton.addEventListener("click", () => {
            this.solveMaze();
        });
    }

    private regenerateGrid(): void {
        const rows = parseInt(this.rowSlider.value, 10);
        const cols = parseInt(this.colSlider.value, 10);
        const speed = parseInt(this.speedSlider.value, 10);

        this.gridManager = new GridManager(rows, cols);
        this.solver = new MazeSolver(this.gridManager.currentGrid, this.renderer, speed);

        this.renderer.resizeCanvas(cols, rows);
        this.renderer.drawGrid(this.gridManager.currentGrid);
    }

    private async solveMaze(): Promise<void> {
        this.disableControls(true);

        // Clear previous solution
        const grid = this.gridManager.currentGrid;
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                grid[row][col].isExplored = false;
                grid[row][col].isPath = false;
            }
        }
        this.renderer.drawGrid(grid);

        const algorithm = this.algorithmSelect.value as PathfindingAlgorithm;
        const speed = parseInt(this.speedSlider.value, 10);
        this.solver = new MazeSolver(grid, this.renderer, speed);
        await this.solver.solve(algorithm);

        this.disableControls(false);
    }

    private disableControls(disabled: boolean): void {
        this.solveButton.disabled = disabled;
        this.regenerateButton.disabled = disabled;
        this.rowSlider.disabled = disabled;
        this.colSlider.disabled = disabled;
        this.algorithmSelect.disabled = disabled;
        this.speedSlider.disabled = disabled;
    }

    private handleSliderChange(): void {
        this.regenerateGrid();
    }
}

export { MazeController };
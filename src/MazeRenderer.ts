import { Cell } from './types';

// Renderer Class
class MazeRenderer {
    private ctx: CanvasRenderingContext2D;
    private cellSize: number;
    private readonly MIN_CELL_SIZE = 2;
    private readonly MAX_CELL_SIZE = 40;
    private dpr: number;

    constructor(private canvas: HTMLCanvasElement) {
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');
        this.ctx = context;
        this.cellSize = this.MAX_CELL_SIZE;
        this.dpr = window.devicePixelRatio || 1;
        this.setupCanvas();
    }

    private setupCanvas(): void {
        // Set canvas size based on device pixel ratio
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;

        // Scale the context to ensure correct drawing operations
        this.ctx.scale(this.dpr, this.dpr);

        // Set canvas CSS size
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }

    resizeCanvas(cols: number, rows: number): void {
        // Calculate the available space
        const maxWidth = window.innerWidth - 400; // Account for sidebar and padding
        const maxHeight = window.innerHeight - 100; // Account for padding

        // Calculate the cell size based on available space
        const cellSizeFromWidth = Math.floor(maxWidth / cols);
        const cellSizeFromHeight = Math.floor(maxHeight / rows);

        // Use the smaller of the two sizes to ensure maze fits
        this.cellSize = Math.max(
            this.MIN_CELL_SIZE,
            Math.min(
                Math.min(cellSizeFromWidth, cellSizeFromHeight),
                this.MAX_CELL_SIZE
            )
        );

        // Calculate physical canvas size
        const canvasWidth = cols * this.cellSize;
        const canvasHeight = rows * this.cellSize;

        // Set physical canvas size with DPI scaling
        this.canvas.width = canvasWidth * this.dpr;
        this.canvas.height = canvasHeight * this.dpr;

        // Set CSS size
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;

        // Scale the context
        this.ctx.scale(this.dpr, this.dpr);

        // Update stats display
        const gridSizeInfo = document.getElementById('gridSizeInfo');
        const cellSizeInfo = document.getElementById('cellSizeInfo');
        if (gridSizeInfo) gridSizeInfo.textContent = `${rows} x ${cols}`;
        if (cellSizeInfo) cellSizeInfo.textContent = `${this.cellSize}px`;
    }

    drawGrid(grid: Cell[][]): void {
        const rows = grid.length;
        const cols = grid[0].length;

        if (rows === 0 || cols === 0) {
            return;
        }

        // Clear the canvas with proper scaling
        this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

        // Draw cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = grid[row][col];
                const x = col * this.cellSize;
                const y = row * this.cellSize;

                // Fill cell based on state
                if (cell.isStart) {
                    this.ctx.fillStyle = '#2ecc71'; // Green
                } else if (cell.isEnd) {
                    this.ctx.fillStyle = '#e74c3c'; // Red
                } else if (cell.isPath) {
                    this.ctx.fillStyle = '#ff79c6'; // Pink
                } else if (cell.isExplored) {
                    this.ctx.fillStyle = '#74b9ff'; // Light blue
                } else {
                    this.ctx.fillStyle = '#ffffff'; // White
                }

                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

                // Draw walls with proper scaling
                this.ctx.strokeStyle = '#2c3e50';
                this.ctx.lineWidth = Math.max(1, this.cellSize / 20) * this.dpr;

                // Draw right wall
                if (cell.rightWall) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.cellSize, y);
                    this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
                    this.ctx.stroke();
                }

                // Draw bottom wall
                if (cell.bottomWall) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y + this.cellSize);
                    this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
                    this.ctx.stroke();
                }

                // Always draw left and top walls for first row/column
                if (col === 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x, y + this.cellSize);
                    this.ctx.stroke();
                }
                if (row === 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + this.cellSize, y);
                    this.ctx.stroke();
                }
            }
        }
    }

    stopAnimation(): void {
        // Implementation remains the same
    }
}

export { MazeRenderer };
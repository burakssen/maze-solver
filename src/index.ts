import './app.css';

import { MazeController } from './MazeController';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mazeCanvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas element not found');

    const rowSlider = document.getElementById('rowSlider') as HTMLInputElement;
    const colSlider = document.getElementById('colSlider') as HTMLInputElement;
    const rowValue = document.getElementById('rowValue') as HTMLSpanElement;
    const colValue = document.getElementById('colValue') as HTMLSpanElement;
    const regenerateButton = document.getElementById('regenerateButton') as HTMLButtonElement;
    const solveButton = document.getElementById('solveButton') as HTMLButtonElement;
    const algorithmSelect = document.getElementById('algorithmSelect') as HTMLSelectElement;

    if (!rowSlider || !colSlider || !rowValue || !colValue || !regenerateButton || !solveButton || !algorithmSelect) {
        throw new Error('Required elements not found');
    }

    new MazeController(
        canvas,
        rowSlider,
        colSlider,
        rowValue,
        colValue,
        regenerateButton,
        solveButton,
        algorithmSelect
    );
});
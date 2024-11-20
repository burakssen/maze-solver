interface Cell {
    rightWall: boolean;
    bottomWall: boolean;
    visited: boolean;
    isStart: boolean;
    isEnd: boolean;
    isExplored?: boolean;
    isPath?: boolean;
}

type PathfindingAlgorithm = 'BFS' | 'DFS' | 'AStar';

export type { Cell, PathfindingAlgorithm };
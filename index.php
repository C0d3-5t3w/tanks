<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tanks</title>
    <link rel="stylesheet" href="static/css/tanks.css">
</head>
<body>
    <div class="game-container">
        <h1>Tanks</h1>
        <div class="game-info">
            <div class="score player1">Player 1: <span id="score1">0</span></div>
            <div class="score player2">Player 2: <span id="score2">0</span></div>
        </div>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <div class="controls">
            <div class="control-info">
                <h3>Player 1 Controls</h3>
                <p>W, A, S, D to move, Space to shoot</p>
            </div>
            <div class="control-info">
                <h3>Player 2 Controls</h3>
                <p>Arrow keys to move, Enter to shoot</p>
            </div>
        </div>
        <button id="restartBtn" class="restart-btn">Restart Game</button>
    </div>
    <script src="static/js/tanks.js"></script>
</body>
</html>

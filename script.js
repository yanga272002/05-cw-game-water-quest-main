// =============================================================================
// charity: water – Water Quest Game
// =============================================================================

// Difficulty configurations (Option 2: Target Goal & Time Limit)
const DIFFICULTY_LEVELS = {
  easy: {
    name: 'Easy',
    goalCans: 15,     // Goal: Collect 15 cans
    duration: 35      // Time Limit: 35 seconds
  },
  medium: {
    name: 'Medium',
    goalCans: 20,     // Goal: Collect 20 cans (default)
    duration: 30      // Time Limit: 30 seconds
  },
  hard: {
    name: 'Hard',
    goalCans: 22,     // Goal: Collect 22 cans
    duration: 25      // Time Limit: 25 seconds
  }
};

// Array of winning messages shown when player reaches or exceeds the target goal
const winningMessages = [
  "Incredible job! You brought clean and safe water to communities in need!",
  "Mission accomplished! You are an official charity: water champion!",
  "Fantastic speed! Every jerry can you collected helps transform lives!",
  "Victory! You completed the Water Quest and made an amazing impact!",
  "Outstanding effort! You reached your goal and proved clean water changes everything!"
];

// Array of losing/try-again messages shown when player scores less than the target goal
const losingMessages = [
  "Nice try! You didn't quite reach the goal this round. Tap faster and try again!",
  "So close! Don't give up—every drop counts! Hit Play Again to give it another shot.",
  "Good hustle! The communities still need clean water. Give it another try!",
  "Almost there! With a little more speed, you can reach the goal next round!",
  "Great effort! Challenge yourself to beat your score on the next attempt!"
];

// Game state variables
let currentDifficulty = 'medium';                                  // Active difficulty level
let goalCans = DIFFICULTY_LEVELS[currentDifficulty].goalCans;      // Items needed to win
let gameDuration = DIFFICULTY_LEVELS[currentDifficulty].duration;  // Round length in seconds
let currentCans = 0;                                               // Number of cans collected
let timeLeft = gameDuration;                                       // Remaining time in seconds
let gameActive = false;                                            // Tracks if game is running
let spawnInterval = null;                                          // Interval for spawning items
let timerInterval = null;                                          // Interval for countdown timer

// State tracking for progress milestones during gameplay
let milestones = {
  quarter: false,
  half: false,
  threeQuarter: false,
  goal: false
};

// DOM Element references
const currentCansDisplay = document.getElementById('current-cans');
const timerDisplay = document.getElementById('timer');
const achievementsDisplay = document.getElementById('achievements');
const startButton = document.getElementById('start-game');
const grid = document.querySelector('.game-grid');
const instructionsDisplay = document.querySelector('.game-instructions');
const difficultyButtons = document.querySelectorAll('.diff-btn');

// Resets all milestone flags for a new round
function resetMilestones() {
  milestones = {
    quarter: false,
    half: false,
    threeQuarter: false,
    goal: false
  };
}

// Displays an encouraging milestone cheer message on screen
function showMilestone(message) {
  achievementsDisplay.textContent = message;
  achievementsDisplay.className = 'achievement milestone';
}

// Checks whether the player reached milestone thresholds during gameplay
function checkMilestones() {
  // 100% Goal Reached milestone (Target hit!)
  if (currentCans >= goalCans && !milestones.goal) {
    milestones.goal = true;
    showMilestone(`🎉 Goal reached! You brought clean water! Keep tapping for a high score!`);
  }
  // 75% Milestone (Almost there!)
  else if (currentCans >= Math.floor(goalCans * 0.75) && !milestones.threeQuarter) {
    milestones.threeQuarter = true;
    const remaining = goalCans - currentCans;
    showMilestone(`⚡ Almost there! Only ${remaining} cans left to win!`);
  }
  // 50% Milestone (Halfway mark!)
  else if (currentCans >= Math.floor(goalCans * 0.5) && !milestones.half) {
    milestones.half = true;
    showMilestone(`💧 Halfway there! ${currentCans} of ${goalCans} cans gathered!`);
  }
  // 25% Milestone (Good start!)
  else if (currentCans >= Math.floor(goalCans * 0.25) && !milestones.quarter) {
    milestones.quarter = true;
    showMilestone(`🌟 Great start! You've collected ${currentCans} cans!`);
  }
}

// Creates the 3x3 game grid where items will appear
function createGrid() {
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Spawns a new item in a random grid cell
function spawnWaterCan() {
  // Stop if the game is not active or time has run out
  if (!gameActive || timeLeft <= 0) {
    return;
  }

  const cells = document.querySelectorAll('.grid-cell');
  
  // Clear all cells before spawning a new water can
  cells.forEach(cell => (cell.innerHTML = ''));

  // Select a random cell from the grid to place the water can
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  // Use a template literal to create the wrapper and water-can element
  randomCell.innerHTML = `
    <div class="water-can-wrapper">
      <div class="water-can"></div>
    </div>
  `;

  // Find the wrapper element so we can listen for clicks
  const canWrapper = randomCell.querySelector('.water-can-wrapper');

  // Add a click handler to score points when the can is clicked
  canWrapper.addEventListener('click', function() {
    // Only register points if the game is active and time remains
    if (!gameActive || timeLeft <= 0) {
      return;
    }

    // Add +1 point for each can clicked
    currentCans++;

    // Update the score display using a template literal
    currentCansDisplay.textContent = `${currentCans}`;

    // Remove the can so the player cannot click the same can multiple times
    randomCell.innerHTML = '';

    // Check if the player has unlocked any progress milestones
    checkMilestones();
  });
}

// Starts the countdown timer
function startTimer() {
  // Ensure any previous timer interval is cleared
  if (timerInterval !== null) {
    clearInterval(timerInterval);
  }

  // Update timer display immediately using a template literal
  timerDisplay.textContent = `${timeLeft}`;

  // Count down every second (1000 milliseconds)
  timerInterval = setInterval(function() {
    timeLeft--;

    // Update the timer display using a template literal
    timerDisplay.textContent = `${timeLeft}`;

    // When the timer reaches 0 or falls below, end the game
    if (timeLeft <= 0 || !gameActive) {
      endGame();
    }
  }, 1000);
}

// Displays a winning or losing message when the game ends
function displayEndMessage() {
  // If player scores equal to or more than the goal, pick and show a winning message
  if (currentCans >= goalCans && !gameActive) {
    // Randomly select a message from the winningMessages array
    const randomIndex = Math.floor(Math.random() * winningMessages.length);
    const winMessage = winningMessages[randomIndex];

    // Format the victory message using template literals
    achievementsDisplay.textContent = `🎉 ${winMessage} Final Score: ${currentCans} / ${goalCans} cans collected!`;
    achievementsDisplay.className = 'achievement win';
  } else {
    // If player scores less than the goal, pick and show a "try again" message
    const randomIndex = Math.floor(Math.random() * losingMessages.length);
    const loseMessage = losingMessages[randomIndex];

    // Format the try again message using template literals
    achievementsDisplay.textContent = `💧 ${loseMessage} Final Score: ${currentCans} / ${goalCans} cans collected.`;
    achievementsDisplay.className = 'achievement lose';
  }
}

// Sets up difficulty buttons and handles mode changes
function setupDifficultyControls() {
  difficultyButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Do not allow changing difficulty while a round is in progress
      if (gameActive) {
        return;
      }

      // Remove active class from all difficulty buttons
      difficultyButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to the clicked button
      this.classList.add('active');

      // Update the active difficulty settings
      currentDifficulty = this.getAttribute('data-difficulty');
      goalCans = DIFFICULTY_LEVELS[currentDifficulty].goalCans;
      gameDuration = DIFFICULTY_LEVELS[currentDifficulty].duration;
      timeLeft = gameDuration;

      // Reset milestones for new difficulty
      resetMilestones();

      // Update the instructions and timer displays using template literals
      instructionsDisplay.textContent = `Collect ${goalCans} items in ${gameDuration}s to complete the game!`;
      timerDisplay.textContent = `${timeLeft}`;

      // Reset score and clear previous end-game message
      currentCans = 0;
      currentCansDisplay.textContent = `${currentCans}`;
      achievementsDisplay.textContent = '';
      achievementsDisplay.className = 'achievement';
    });
  });
}

// Initializes and starts a new game round
function startGame() {
  // Prevent starting a new game if one is already in progress
  if (gameActive && timeLeft > 0) {
    return;
  }

  // Activate the game
  gameActive = true;

  // Disable difficulty buttons while the game is running
  difficultyButtons.forEach(btn => (btn.disabled = true));

  // Reset score, milestones, and timer values for the current difficulty
  currentCans = 0;
  timeLeft = gameDuration;
  resetMilestones();

  // Reset UI displays using template literals
  currentCansDisplay.textContent = `${currentCans}`;
  timerDisplay.textContent = `${timeLeft}`;

  // Clear previous achievement messages
  achievementsDisplay.textContent = '';
  achievementsDisplay.className = 'achievement';

  // Update button text while playing
  startButton.textContent = 'Game in Progress...';
  startButton.disabled = true;

  // Set up the game grid
  createGrid();

  // Spawn the first water can right away
  spawnWaterCan();

  // Spawn water cans every second (1000ms)
  spawnInterval = setInterval(spawnWaterCan, 1000);

  // Start the countdown timer
  startTimer();
}

// Ends the game when the timer runs out
function endGame() {
  // Mark game as inactive
  gameActive = false;

  // Stop spawning water cans and stop the timer countdown
  if (spawnInterval !== null) {
    clearInterval(spawnInterval);
    spawnInterval = null;
  }

  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Clear remaining cans from the grid
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  // Ensure timer display reads 0
  timerDisplay.textContent = '0';

  // Re-enable difficulty buttons and start button so player can choose or replay
  difficultyButtons.forEach(btn => (btn.disabled = false));
  startButton.textContent = 'Play Again';
  startButton.disabled = false;

  // Randomly pick and display the appropriate end-game message
  displayEndMessage();
}

// Initialize the game grid and difficulty listeners on page load
createGrid();
setupDifficultyControls();

// Set up click handler for the start button
startButton.addEventListener('click', startGame);

# Personal Fitness Tracker

This is a comprehensive, command-line interface (CLI) based personal fitness tracker built with Node.js.

## Features

- **Local Authentication**: Securely register and log in to your personal account.
- **Dashboard**: Get a quick overview of your daily progress, nutrition targets, and alerts.
- **Nutrition Planning**: Automatically calculates your daily calorie and macronutrient needs based on your profile (height, weight, age, activity level) and goals (lose, maintain, gain weight).
- **Food & Water Tracking**: Log your meals and water intake throughout the day.
- **Workout Planner**: Create custom workout plans with progressive overload. The app will recommend adjustments to your weights/reps based on your performance.
- **Workout Logging**: Record your completed workouts to track progress and fuel recommendations.
- **Personal Record (PR) Tracking**: Log and view your personal bests for any exercise.
- **Alerts System**: Get notified when you're falling behind on your nutrition or hydration goals.
- **(Experimental) Food Estimation**: Estimate the nutritional content of a meal by providing a path to an image. *This is a mock feature and does not use a real AI model.*

## Project Structure

The project is organized into the following directories:

- `/auth`: Handles user authentication and session management.
- `/commands`: Contains all the CLI commands available to the user.
- `/config`: Stores configuration variables for the application.
- `/data`: Stores all application data in JSON files, including users, logs, and plans.
- `/models`: Defines the data structures (classes) for the application.
- `/services`: Contains the core business logic for features like nutrition calculation, workout planning, and data persistence.
- `/utils`: Utility functions (currently unused, but available for future needs).

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone this repository (or download the files).
2. Open a terminal in the project's root directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the interactive CLI, run:

```bash
npm start
```

This will present you with a menu of available commands.

## How to Use

1.  **Register**: The first time you launch the app, choose the "Register" option. You'll be prompted to enter your profile information and fitness goals. This is crucial for the app to calculate your personalized nutrition and workout plans.
2.  **Login**: Once registered, you can log in with your username and password.
3.  **Use the Commands**: After logging in, you'll see a menu of available actions:
    *   **View Dashboard**: Your main screen. Check your progress and alerts here first.
    *   **Create a New Workout Plan**: Before you can work out, create a plan. Define your exercises, sets, reps, and starting weights.
    *   **Get Today's Workout**: The app will look at your plan and your last performance to recommend what you should do today.
    *   **Log a Completed Workout**: After your session, log what you actually did. This is how the app knows when to progress you.
    *   **Add a Meal / Add Water**: Keep your daily log updated to track your nutrition.
    *   **Add a New PR**: Did you hit a new best? Record it!

All your data is stored locally in the `/data` directory in a set of human-readable JSON files.

// index.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('./auth/auth.service');

// Command imports
const registerCommand = require('./commands/register');
const loginCommand = require('./commands/login');
const logoutCommand = require('./commands/logout');
const dashboardCommand = require('./commands/dashboard');
const addMealCommand = require('./commands/add-meal');
const addWaterCommand = require('./commands/add-water');
const logWorkoutCommand = require('./commands/log-workout');

const viewPRsCommand = require('./commands/view-prs');
const addPRCommand = require('./commands/add-pr');
const updateProfileCommand = require('./commands/update-profile');
const getWorkoutCommand = require('./commands/get-workout');
const estimateFoodCommand = require('./commands/estimate-food');

const main = async () => {
    console.log(chalk.bold.green('--- Welcome to your Personal Fitness Tracker ---'));
    
    const user = await authService.getLoggedInUser();

    if (user) {
        // Logged-in menu
        const { command } = await inquirer.prompt([
            {
                type: 'list',
                name: 'command',
                message: `What would you like to do, ${user.username}?`,
                choices: [
                    { name: 'View Dashboard', value: 'dashboard' },
                    { name: 'Add a Meal', value: 'add-meal' },
                    { name: 'Add Water Intake', value: 'add-water' },
                    { name: 'Get Today\'s Workout', value: 'get-workout' },
                    { name: 'Log a Completed Workout', value: 'log-workout' },

                    { name: 'View Personal Records (PRs)', value: 'view-prs' },
                    { name: 'Add a New PR', value: 'add-pr' },
                    { name: 'Estimate Food from Image', value: 'estimate-food' },
                    { name: 'Update My Profile', value: 'update-profile' },
                    new inquirer.Separator(),
                    { name: 'Logout', value: 'logout' },
                    { name: 'Exit', value: 'exit' },
                ],
            },
        ]);
        await handleCommand(command);
    } else {
        // Logged-out menu
        const { command } = await inquirer.prompt([
            {
                type: 'list',
                name: 'command',
                message: 'What would you like to do?',
                choices: [
                    { name: 'Login', value: 'login' },
                    { name: 'Register', value: 'register' },
                    { name: 'Exit', value: 'exit' },
                ],
            },
        ]);
        await handleCommand(command);
    }
};

const handleCommand = async (command) => {
    switch (command) {
        case 'register':
            await registerCommand();
            break;
        case 'login':
            await loginCommand();
            break;
        case 'logout':
            await logoutCommand();
            break;
        case 'dashboard':
            await dashboardCommand();
            break;
        case 'add-meal':
            await addMealCommand();
            break;
        case 'add-water':
            await addWaterCommand();
            break;
        case 'log-workout':
            await logWorkoutCommand();
            break;

        case 'view-prs':
            await viewPRsCommand();
            break;
        case 'add-pr':
            await addPRCommand();
            break;
        case 'update-profile':
            await updateProfileCommand();
            break;
        case 'get-workout':
            await getWorkoutCommand();
            break;
        case 'estimate-food':
            await estimateFoodCommand();
            break;
        case 'exit':
            console.log(chalk.blue('Goodbye!'));
            process.exit(0);
    }

    // After a command runs, show the main menu again unless exiting
    if (command !== 'exit') {
        await main();
    }
};


main().catch(error => {
    console.error(chalk.red('An unexpected error occurred:'));
    console.error(error);
    process.exit(1);
});

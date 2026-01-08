// commands/add-pr.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const trackingService = require('../services/tracking.service');

const addPRCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to add a PR.'));
            return;
        }

        const { exercise } = await inquirer.prompt([
            { type: 'input', name: 'exercise', message: 'What exercise did you set a PR in?' }
        ]);

        const { prType } = await inquirer.prompt([
            { type: 'list', name: 'prType', message: 'Is this a weight/rep or a time-based PR?', choices: ['Weight/Reps', 'Time'] }
        ]);

        let value;
        if (prType === 'Weight/Reps') {
            const answers = await inquirer.prompt([
                { type: 'number', name: 'weight', message: 'Weight (kg):' },
                { type: 'number', name: 'reps', message: 'Reps:' },
            ]);
            value = { weight: answers.weight, reps: answers.reps };
        } else {
            const { time } = await inquirer.prompt([
                { type: 'input', name: 'time', message: 'Time (e.g., 5:30):' }
            ]);
            value = { time };
        }

        await trackingService.addPR(user.id, exercise, value);
        console.log(chalk.green('Personal Record added successfully!'));

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = addPRCommand;

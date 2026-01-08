// commands/add-water.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const trackingService = require('../services/tracking.service');

const addWaterCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to add water intake.'));
            return;
        }

        const questions = [
            {
                type: 'number',
                name: 'amount',
                message: 'Amount of water in ml:',
            },
        ];

        const { amount } = await inquirer.prompt(questions);
        await trackingService.addWaterIntake(user.id, amount);
        console.log(chalk.green('Water intake updated!'));

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = addWaterCommand;

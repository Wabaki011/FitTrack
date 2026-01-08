// commands/add-meal.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const trackingService = require('../services/tracking.service');

const addMealCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to add a meal.'));
            return;
        }

        const questions = [
            { type: 'input', name: 'name', message: 'Meal name:' },
            { type: 'number', name: 'calories', message: 'Calories:' },
            { type: 'number', name: 'protein', message: 'Protein (g):' },
            { type: 'number', name: 'carbs', message: 'Carbohydrates (g):' },
            { type: 'number', name: 'fat', message: 'Fat (g):' },
        ];

        const meal = await inquirer.prompt(questions);
        await trackingService.addMeal(user.id, meal);
        console.log(chalk.green('Meal added successfully!'));

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = addMealCommand;

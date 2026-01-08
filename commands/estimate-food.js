// commands/estimate-food.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const foodEstimationService = require('../services/food-estimation.service');
const trackingService = require('../services/tracking.service');

const estimateFoodCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to use this feature.'));
            return;
        }

        const { imagePath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'imagePath',
                message: 'Enter the path to the food image:',
            },
        ]);

        const estimation = await foodEstimationService.estimateFoodFromImage(imagePath);
        console.log(chalk.cyan('--- Estimation Results ---'));
        console.log(`- Name: ${estimation.name}`);
        console.log(`- Calories: ~${estimation.calories} kcal`);
        console.log(`- Protein: ~${estimation.protein}g`);
        console.log(`- Carbs: ~${estimation.carbs}g`);
        console.log(`- Fat: ~${estimation.fat}g`);
        console.log(`- Confidence: ${Math.round(estimation.confidence * 100)}%`);

        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Do you want to add this to your food log?',
                default: true,
            },
        ]);

        if (confirm) {
            const meal = {
                name: estimation.name,
                calories: estimation.calories,
                protein: estimation.protein,
                carbs: estimation.carbs,
                fat: estimation.fat,
            };
            await trackingService.addMeal(user.id, meal);
            console.log(chalk.green('Meal added to your log!'));
        }

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = estimateFoodCommand;

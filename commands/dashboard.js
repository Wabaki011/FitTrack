// commands/dashboard.js
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const nutritionService = require('../services/nutrition.service');
const trackingService = require('../services/tracking.service');
const alertService = require('../services/alert.service');

const dashboardCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to view the dashboard.'));
            return;
        }

        console.log(chalk.bold.cyan(`--- ${user.username}'s Dashboard ---`));
        const today = new Date().toISOString().split('T')[0];

        // Nutrition Plan
        try {
            const nutritionPlan = nutritionService.getNutritionPlan(user);
            console.log(chalk.bold.yellow('\nYour Daily Nutrition Plan:'));
            console.log(`- Calorie Target: ${nutritionPlan.calorieTarget} kcal`);
            console.log(`- Macros: ${nutritionPlan.macros.protein}g Protein, ${nutritionPlan.macros.carbs}g Carbs, ${nutritionPlan.macros.fat}g Fat`);
        } catch (e) {
            console.log(chalk.yellow('\nYour nutrition plan is not fully configured. Please update your profile.'));
        }

        // Today's Progress
        const foodLog = await trackingService.getFoodLogForDate(user.id, today);
        const waterLog = await trackingService.getWaterLogForDate(user.id, today);

        console.log(chalk.bold.yellow('\nToday\'s Progress:'));
        if (foodLog) {
            const { calories, protein, carbs, fat } = foodLog.totals;
            console.log(`- Nutrition: ${calories} kcal, ${protein}g P, ${carbs}g C, ${fat}g F`);
        } else {
            console.log('- Nutrition: No meals logged yet today.');
        }
        if (waterLog) {
            console.log(`- Water: ${waterLog.amount} ml / ${user.goals.waterTarget || 3000} ml`);
        } else {
            console.log(`- Water: No water logged yet today.`);
        }

        // Alerts
        const alerts = await alertService.getAlerts(user);
        if (alerts.length > 0) {
            console.log(chalk.bold.red('\nAlerts:'));
            alerts.forEach(alert => console.log(chalk.red(`- ${alert}`)));
        } else {
            console.log(chalk.bold.green('\nNo alerts. You\'re on track!'));
        }

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = dashboardCommand;

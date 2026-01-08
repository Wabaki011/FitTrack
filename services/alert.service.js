// services/alert.service.js
const nutritionService = require('./nutrition.service');
const trackingService = require('./tracking.service');

const getAlerts = async (user) => {
    const alerts = [];
    const today = new Date().toISOString().split('T')[0];

    // Nutrition Alerts
    try {
        const nutritionPlan = nutritionService.getNutritionPlan(user);
        const foodLog = await trackingService.getFoodLogForDate(user.id, today);
        const waterLog = await trackingService.getWaterLogForDate(user.id, today);

        const caloriesConsumed = foodLog ? foodLog.totals.calories : 0;
        const proteinConsumed = foodLog ? foodLog.totals.protein : 0;
        const carbsConsumed = foodLog ? foodLog.totals.carbs : 0;
        const fatConsumed = foodLog ? foodLog.totals.fat : 0;
        const waterConsumed = waterLog ? waterLog.amount : 0;

        // Check calorie deficit/surplus
        const hour = new Date().getHours();
        const percentOfDayPassed = hour / 24;
        const expectedCalories = nutritionPlan.calorieTarget * percentOfDayPassed;
        if (caloriesConsumed < expectedCalories * 0.8) {
            alerts.push(`You are behind on your calorie intake for today. Target: ${Math.round(expectedCalories)}, Consumed: ${caloriesConsumed}`);
        }

        // Check macros at the end of the day
        if (hour > 20) { // After 8 PM
            if (proteinConsumed < nutritionPlan.macros.protein * 0.9) {
                alerts.push(`You are low on your protein goal for today. Target: ${nutritionPlan.macros.protein}g, Consumed: ${proteinConsumed}g`);
            }
            if (carbsConsumed < nutritionPlan.macros.carbs * 0.9) {
                alerts.push(`You are low on your carbohydrate goal for today. Target: ${nutritionPlan.macros.carbs}g, Consumed: ${carbsConsumed}g`);
            }
            if (fatConsumed < nutritionPlan.macros.fat * 0.9) {
                alerts.push(`You are low on your fat goal for today. Target: ${nutritionPlan.macros.fat}g, Consumed: ${fatConsumed}g`);
            }
        }

        // Check water intake
        const dailyWaterTarget = user.goals.waterTarget || 3000; // Default 3L
        const expectedWater = dailyWaterTarget * percentOfDayPassed;
        if (waterConsumed < expectedWater * 0.8) {
            alerts.push(`You are behind on your water intake. Target: ${Math.round(expectedWater)}ml, Consumed: ${waterConsumed}ml`);
        }

    } catch (error) {
        // Incomplete profile, can't generate nutrition alerts
        alerts.push('Please complete your profile and goals to receive nutrition alerts.');
    }

    // Workout Alerts (to be implemented with workout schedule)
    // e.g., check if a workout was missed

    return alerts;
};

module.exports = {
    getAlerts,
};

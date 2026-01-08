// models/food-log.model.js

class FoodLog {
    constructor(id, userId, date, meals) {
        this.id = id;
        this.userId = userId;
        this.date = date; // YYYY-MM-DD
        this.meals = meals; // [{ name, calories, protein, carbs, fat }]
        this.totals = this.calculateTotals();
    }

    calculateTotals() {
        const totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        };

        this.meals.forEach(meal => {
            totals.calories += meal.calories;
            totals.protein += meal.protein;
            totals.carbs += meal.carbs;
            totals.fat += meal.fat;
        });

        return totals;
    }

    addMeal(meal) {
        this.meals.push(meal);
        this.totals = this.calculateTotals();
    }
}

module.exports = FoodLog;

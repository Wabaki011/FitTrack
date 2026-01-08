// services/nutrition.service.js

const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    if (gender.toLowerCase() === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
};

const calculateTDEE = (bmr, activityLevel) => {
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very: 1.9,
    };
    return bmr * (activityMultipliers[activityLevel] || 1.2);
};

const calculateCalorieTarget = (tdee, goal, weeklyGoal) => {
    const calorieAdjustment = weeklyGoal * 500; // 500 calories per pound of weight change
    if (goal === 'lose') {
        return tdee - calorieAdjustment;
    } else if (goal === 'gain') {
        return tdee + calorieAdjustment;
    }
    return tdee; // 'maintain'
};

const calculateMacroDistribution = (calories, distribution) => {
    const { protein, carbs, fat } = distribution; // e.g., { protein: 0.3, carbs: 0.4, fat: 0.3 }
    const total = protein + carbs + fat;

    if (total !== 1) {
        throw new Error('Macro distribution must add up to 1.');
    }

    const proteinGrams = (calories * protein) / 4;
    const carbsGrams = (calories * carbs) / 4;
    const fatGrams = (calories * fat) / 9;

    return {
        protein: Math.round(proteinGrams),
        carbs: Math.round(carbsGrams),
        fat: Math.round(fatGrams),
    };
};

const getNutritionPlan = (user) => {
    const { profile, goals } = user;
    const { weight, height, age, gender, activityLevel } = profile;
    const { goal, weeklyGoal, macroDistribution } = goals;

    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
        throw new Error('User profile and goals must be complete to calculate a nutrition plan.');
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const calorieTarget = calculateCalorieTarget(tdee, goal, weeklyGoal);
    const macros = calculateMacroDistribution(calorieTarget, macroDistribution);

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calorieTarget: Math.round(calorieTarget),
        macros,
    };
};

module.exports = {
    getNutritionPlan,
};

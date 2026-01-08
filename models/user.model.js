// models/user.model.js

class User {
    constructor(id, username, password, profile, goals, workoutPlanId = null) {
        this.id = id;
        this.username = username;
        this.password = password; // Hashed password
        this.profile = { // { age: number, gender: string, height: string, weight: number }
            age: profile.age,
            gender: profile.gender,
            height: profile.height,
            weight: profile.weight
        };
        this.goals = { // { targetWeight: number, goalType: string, activityLevel: string, weeklyGoal: number, macroDistribution: { protein: number, carbs: number, fats: number } }
            targetWeight: goals.targetWeight || null,
            goalType: goals.goalType || 'maintain', // e.g., 'lose weight', 'gain muscle', 'maintain'
            activityLevel: goals.activityLevel || 'sedentary', // e.g., 'sedentary', 'lightly active', 'moderately active', 'very active'
            weeklyGoal: goals.weeklyGoal || 0, // e.g., 0.5 (kg/week to lose/gain)
            macroDistribution: goals.macroDistribution || { protein: 30, carbs: 40, fats: 30 } // percentages
        };
        this.workoutPlanId = workoutPlanId;
    }
}

module.exports = User;

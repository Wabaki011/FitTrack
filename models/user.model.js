// models/user.model.js

class User {
    constructor(id, username, password, profile, goals, workoutPlanId = null) {
        this.id = id;
        this.username = username;
        this.password = password; // Hashed password
        this.profile = profile; // { height, weight, age, gender, activityLevel }
        this.goals = goals; // { targetWeight, goal, weeklyGoal, macroDistribution }
        this.workoutPlanId = workoutPlanId;
    }
}

module.exports = User;

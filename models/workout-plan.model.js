// models/workout-plan.model.js

class WorkoutPlan {
    constructor(id, userId, name, description, exercises) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.exercises = exercises; // [{ name, targetSets, targetReps, targetWeight, rest, progression }]
    }
}

module.exports = WorkoutPlan;

// models/workout-log.model.js

class WorkoutLog {
    constructor(id, userId, date, planId, exercises) {
        this.id = id;
        this.userId = userId;
        this.date = date; // YYYY-MM-DD
        this.planId = planId;
        this.exercises = exercises; // [{ name, sets: [{ reps, weight }] }]
    }
}

module.exports = WorkoutLog;

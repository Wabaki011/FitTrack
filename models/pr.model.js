// models/pr.model.js

class PersonalRecord {
    constructor(id, userId, exercise, value, date) {
        this.id = id;
        this.userId = userId;
        this.exercise = exercise; // e.g., "Bench Press", "1-Mile Run"
        this.value = value; // e.g., { weight: 100, reps: 5 } or { time: "5:30" }
        this.date = date;
    }
}

module.exports = PersonalRecord;

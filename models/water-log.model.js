// models/water-log.model.js

class WaterLog {
    constructor(id, userId, date, amount) {
        this.id = id;
        this.userId = userId;
        this.date = date; // YYYY-MM-DD
        this.amount = amount; // in milliliters
    }
}

module.exports = WaterLog;

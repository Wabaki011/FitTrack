// services/tracking.service.js
const dataService = require('./data.service');
const { v4: uuidv4 } = require('uuid');
const FoodLog = require('../models/food-log.model');
const WaterLog = require('../models/water-log.model');
const PersonalRecord = require('../models/pr.model');

// --- Food Tracking ---

const addMeal = async (userId, meal) => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let foodLog = (await dataService.findByProperty('food-logs', 'userId', userId))
        .find(log => log.date === date);

    if (foodLog) {
        foodLog.meals.push(meal);
        const updatedLog = new FoodLog(foodLog.id, userId, date, foodLog.meals);
        return dataService.update('food-logs', foodLog.id, updatedLog);
    } else {
        const newLog = new FoodLog(uuidv4(), userId, date, [meal]);
        return dataService.create('food-logs', newLog);
    }
};

const getFoodLogForDate = async (userId, date) => {
    return (await dataService.findByProperty('food-logs', 'userId', userId))
        .find(log => log.date === date);
};

// --- Water Tracking ---

const addWaterIntake = async (userId, amount) => {
    const date = new Date().toISOString().split('T')[0];
    let waterLog = (await dataService.findByProperty('water-logs', 'userId', userId))
        .find(log => log.date === date);

    if (waterLog) {
        waterLog.amount += amount;
        return dataService.update('water-logs', waterLog.id, waterLog);
    } else {
        const newLog = new WaterLog(uuidv4(), userId, date, amount);
        return dataService.create('water-logs', newLog);
    }
};

const getWaterLogForDate = async (userId, date) => {
    return (await dataService.findByProperty('water-logs', 'userId', userId))
        .find(log => log.date === date);
};

// --- PR Tracking ---

const addPR = async (userId, exercise, value) => {
    const date = new Date().toISOString();
    const newPR = new PersonalRecord(uuidv4(), userId, exercise, value, date);
    return dataService.create('prs', newPR);
};

const getPRsForUser = async (userId) => {
    return dataService.findByProperty('prs', 'userId', userId);
};

module.exports = {
    addMeal,
    getFoodLogForDate,
    addWaterIntake,
    getWaterLogForDate,
    addPR,
    getPRsForUser,
};

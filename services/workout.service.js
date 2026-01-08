// services/workout.service.js
const dataService = require('./data.service');
const { v4: uuidv4 } = require('uuid');
const WorkoutPlan = require('../models/workout-plan.model');
const WorkoutLog = require('../models/workout-log.model');

const createWorkoutPlan = async (userId, name, description, exercises) => {
    const newPlan = new WorkoutPlan(uuidv4(), userId, name, description, exercises);
    return dataService.create('workout-plans', newPlan);
};

const getWorkoutPlan = async (planId) => {
    return dataService.findById('workout-plans', planId);
};

const getWorkoutPlansForUser = async (userId) => {
    return dataService.findByProperty('workout-plans', 'userId', userId);
};

const logWorkout = async (userId, planId, exercises) => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const newLog = new WorkoutLog(uuidv4(), userId, date, planId, exercises);
    await dataService.create('workout-logs', newLog);
    return newLog;
};

const getWorkoutLogsForUser = async (userId) => {
    return dataService.findByProperty('workout-logs', 'userId', userId);
};

const recommendNextWorkout = async (userId, planId) => {
    const plan = await getWorkoutPlan(planId);
    if (!plan) {
        throw new Error('Workout plan not found.');
    }

    const lastWorkout = (await getWorkoutLogsForUser(userId))
        .filter(log => log.planId === planId)
        .pop();

    if (!lastWorkout) {
        // First time doing this plan, return the base plan
        return plan.exercises;
    }

    // Progressive overload logic
    const nextExercises = plan.exercises.map(exercise => {
        const lastExercise = lastWorkout.exercises.find(e => e.name === exercise.name);
        if (!lastExercise) return exercise; // New exercise added to plan

        const didMeetTarget = lastExercise.sets.every((set, i) => {
            const targetSet = exercise.targetSets[i] || exercise.targetSets[0];
            return set.reps >= targetSet.reps;
        });

        if (didMeetTarget) {
            // Successfully completed, increase weight
            const newWeight = (lastExercise.sets[0].weight || 0) + (exercise.progression.weightIncrease || 2.5);
            return {
                ...exercise,
                targetWeight: newWeight
            };
        } else {
            // Failed to meet target, repeat the same weight
            return {
                ...exercise,
                targetWeight: lastExercise.sets[0].weight
            };
        }
    });

    return nextExercises;
};


module.exports = {
    createWorkoutPlan,
    getWorkoutPlan,
    getWorkoutPlansForUser,
    logWorkout,
    getWorkoutLogsForUser,
    recommendNextWorkout,
};

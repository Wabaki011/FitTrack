const dataService = require('./data.service');

const WORKOUT_PLANS_FILE = 'workout-plans';

const getAllWorkoutPlans = async () => {
    return await dataService.find(WORKOUT_PLANS_FILE);
};

const getWorkoutPlanById = async (id) => {
    return await dataService.findById(WORKOUT_PLANS_FILE, id);
};

const getWorkoutPlansByGoal = async (goal) => {
    const allPlans = await getAllWorkoutPlans();
    return allPlans.filter(plan => plan.goal.toLowerCase() === goal.toLowerCase());
};

module.exports = {
    getAllWorkoutPlans,
    getWorkoutPlanById,
    getWorkoutPlansByGoal,
};

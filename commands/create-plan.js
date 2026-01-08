// commands/create-plan.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const workoutService = require('../services/workout.service');

const createPlanCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to create a plan.'));
            return;
        }

        const planQuestions = [
            { type: 'input', name: 'name', message: 'Workout plan name:' },
            { type: 'input', name: 'description', message: 'Plan description:' },
        ];
        const { name, description } = await inquirer.prompt(planQuestions);

        const exercises = [];
        let addMore = true;
        while (addMore) {
            const exerciseQuestions = [
                { type: 'input', name: 'name', message: 'Exercise name:' },
                { type: 'number', name: 'targetSets', message: 'Number of sets:' },
                { type: 'number', name: 'targetReps', message: 'Target reps per set:' },
                { type: 'number', name: 'targetWeight', message: 'Starting weight (kg):' },
                { type: 'input', name: 'rest', message: 'Rest time between sets (e.g., 60s, 2m):', default: '90s' },
                { type: 'number', name: 'weightIncrease', message: 'Weight to add on success (kg):', default: 2.5 },
                { type: 'confirm', name: 'addAnother', message: 'Add another exercise?', default: true },
            ];
            const { addAnother, ...ex } = await inquirer.prompt(exerciseQuestions);
            exercises.push({
                name: ex.name,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                targetWeight: ex.targetWeight,
                rest: ex.rest,
                progression: {
                    weightIncrease: ex.weightIncrease
                }
            });
            addMore = addAnother;
        }

        await workoutService.createWorkoutPlan(user.id, name, description, exercises);
        console.log(chalk.green('Workout plan created successfully!'));

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = createPlanCommand;

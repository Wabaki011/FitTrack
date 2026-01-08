// commands/get-workout.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const workoutService = require('../services/workout.service');

const getWorkoutCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to get a workout.'));
            return;
        }

        const plans = await workoutService.getWorkoutPlansForUser(user.id);
        if (plans.length === 0) {
            console.log(chalk.yellow('You have no workout plans. Create one first.'));
            return;
        }

        const { planId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'planId',
                message: 'Which plan are you following today?',
                choices: plans.map(p => ({ name: p.name, value: p.id })),
            },
        ]);

        const recommendedExercises = await workoutService.recommendNextWorkout(user.id, planId);

        console.log(chalk.bold.cyan('\n--- Your Recommended Workout ---'));
        recommendedExercises.forEach(ex => {
            const weight = ex.targetWeight || 'Bodyweight';
            console.log(`- ${chalk.bold(ex.name)}: ${ex.targetSets} sets of ${ex.targetReps} reps at ${weight}kg. Rest ${ex.rest}.`);
        });

        console.log(chalk.yellow('\nAfter your workout, use the "log-workout" command to record your performance.'));

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = getWorkoutCommand;

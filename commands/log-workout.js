// commands/log-workout.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const workoutService = require('../services/workout.service');

const logWorkoutCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to log a workout.'));
            return;
        }

        const plans = await workoutService.getWorkoutPlansForUser(user.id);
        if (plans.length === 0) {
            console.log(chalk.yellow('You have no workout plans. Please create one first.'));
            return;
        }

        const { planId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'planId',
                message: 'Which workout plan did you complete?',
                choices: plans.map(p => ({ name: p.name, value: p.id })),
            },
        ]);

        const plan = await workoutService.getWorkoutPlan(planId);
        const exercises = [];
        for (const exercise of plan.exercises) {
            console.log(chalk.cyan(`\nLogging exercise: ${exercise.name}`));
            const sets = [];
            for (let i = 0; i < exercise.targetSets; i++) {
                const setAnswers = await inquirer.prompt([
                    { type: 'number', name: 'reps', message: `Reps for set ${i + 1}:` },
                    { type: 'number', name: 'weight', message: `Weight for set ${i + 1}:` },
                ]);
                sets.push(setAnswers);
            }
            exercises.push({ name: exercise.name, sets });
        }

        await workoutService.logWorkout(user.id, planId, exercises);
        console.log(chalk.green('Workout logged successfully!'));

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = logWorkoutCommand;

// commands/update-profile.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const dataService = require('../services/data.service');

const updateProfileCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to update your profile.'));
            return;
        }

        console.log('Current Profile:', user.profile);
        console.log('Current Goals:', user.goals);

        const questions = [
            { type: 'number', name: 'height', message: 'Enter your height in cm:', default: user.profile.height },
            { type: 'number', name: 'weight', message: 'Enter your weight in kg:', default: user.profile.weight },
            { type: 'number', name: 'age', message: 'Enter your age:', default: user.profile.age },
            { type: 'list', name: 'gender', message: 'Select your gender:', choices: ['male', 'female'], default: user.profile.gender },
            { type: 'list', name: 'activityLevel', message: 'Select your activity level:', choices: ['sedentary', 'light', 'moderate', 'active', 'very'], default: user.profile.activityLevel },
            { type: 'list', name: 'goal', message: 'What is your primary goal?', choices: ['lose', 'maintain', 'gain'], default: user.goals.goal },
            { type: 'number', name: 'weeklyGoal', message: 'What is your weekly weight goal in kg?', default: user.goals.weeklyGoal },
            {
                type: 'input',
                name: 'macroDistribution',
                message: 'Enter your desired macro distribution (protein,carbs,fat):',
                default: `${user.goals.macroDistribution.protein},${user.goals.macroDistribution.carbs},${user.goals.macroDistribution.fat}`,
                filter: input => {
                    const [protein, carbs, fat] = input.split(',').map(Number);
                    return { protein, carbs, fat };
                }
            },
            { type: 'number', name: 'waterTarget', message: 'Enter your daily water intake target in ml:', default: user.goals.waterTarget },
        ];

        const answers = await inquirer.prompt(questions);
        const { height, weight, age, gender, activityLevel, goal, weeklyGoal, macroDistribution, waterTarget } = answers;
        
        const updatedUser = {
            ...user,
            profile: { height, weight, age, gender, activityLevel },
            goals: { ...user.goals, goal, weeklyGoal, macroDistribution, waterTarget },
        };

        await dataService.update('users', user.id, updatedUser);
        console.log(chalk.green('Profile updated successfully!'));

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = updateProfileCommand;

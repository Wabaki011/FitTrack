// commands/register.js
const inquirer = require('inquirer');
const authService = require('../auth/auth.service');
const chalk = require('chalk');

const registerCommand = async () => {
    const questions = [
        {
            type: 'input',
            name: 'username',
            message: 'Enter a username:',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter a password:',
            mask: '*',
        },
        {
            type: 'number',
            name: 'height',
            message: 'Enter your height in cm:',
        },
        {
            type: 'number',
            name: 'weight',
            message: 'Enter your weight in kg:',
        },
        {
            type: 'number',
            name: 'age',
            message: 'Enter your age:',
        },
        {
            type: 'list',
            name: 'gender',
            message: 'Select your gender:',
            choices: ['male', 'female'],
        },
        {
            type: 'list',
            name: 'activityLevel',
            message: 'Select your activity level:',
            choices: ['sedentary', 'light', 'moderate', 'active', 'very'],
        },
        {
            type: 'list',
            name: 'goal',
            message: 'What is your primary goal?',
            choices: ['lose', 'maintain', 'gain'],
        },
        {
            type: 'number',
            name: 'weeklyGoal',
            message: 'What is your weekly weight goal in kg (e.g., 0.5 for losing 0.5kg)?',
            default: 0.5,
        },
        {
            type: 'input',
            name: 'macroDistribution',
            message: 'Enter your desired macro distribution (protein,carbs,fat) e.g., 0.3,0.4,0.3:',
            default: '0.3,0.4,0.3',
            filter: input => {
                const [protein, carbs, fat] = input.split(',').map(Number);
                return { protein, carbs, fat };
            }
        },
        {
            type: 'number',
            name: 'waterTarget',
            message: 'Enter your daily water intake target in ml:',
            default: 3000,
        },
    ];

    try {
        const answers = await inquirer.prompt(questions);
        const { username, password, height, weight, age, gender, activityLevel, goal, weeklyGoal, macroDistribution, waterTarget } = answers;
        const profile = { height, weight, age, gender, activityLevel };
        const goals = { targetWeight: 0, goal, weeklyGoal, macroDistribution, waterTarget }; // targetWeight can be refined later

        await authService.register(username, password, profile, goals);
        console.log(chalk.green('User registered successfully! Please log in.'));
    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = registerCommand;

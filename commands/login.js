// commands/login.js
const inquirer = require('inquirer');
const authService = require('../auth/auth.service');
const chalk = require('chalk');

const loginCommand = async () => {
    const questions = [
        {
            type: 'input',
            name: 'username',
            message: 'Username:',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password:',
            mask: '*',
        },
    ];

    try {
        const answers = await inquirer.prompt(questions);
        const user = await authService.login(answers.username, answers.password);
        console.log(chalk.green(`Welcome back, ${user.username}!`));
    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = loginCommand;

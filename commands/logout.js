// commands/logout.js
const authService = require('../auth/auth.service');
const chalk = require('chalk');

const logoutCommand = async () => {
    try {
        await authService.logout();
        console.log(chalk.green('You have been logged out.'));
    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = logoutCommand;

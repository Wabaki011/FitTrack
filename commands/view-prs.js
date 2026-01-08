// commands/view-prs.js
const chalk = require('chalk');
const authService = require('../auth/auth.service');
const trackingService = require('../services/tracking.service');

const viewPRsCommand = async () => {
    try {
        const user = await authService.getLoggedInUser();
        if (!user) {
            console.log(chalk.red('You must be logged in to view your PRs.'));
            return;
        }

        const prs = await trackingService.getPRsForUser(user.id);

        if (prs.length === 0) {
            console.log(chalk.yellow('You have no personal records yet.'));
            return;
        }

        console.log(chalk.bold.cyan('--- Your Personal Records ---'));
        prs.sort((a, b) => new Date(b.date) - new Date(a.date));

        prs.forEach(pr => {
            const date = new Date(pr.date).toLocaleDateString();
            let valueStr = '';
            if (pr.value.time) {
                valueStr = `Time: ${pr.value.time}`;
            } else {
                valueStr = `Weight: ${pr.value.weight}kg, Reps: ${pr.value.reps}`;
            }
            console.log(`- ${chalk.bold(pr.exercise)}: ${valueStr} (${date})`);
        });

    } catch (error) {
        console.error(chalk.red(error.message));
    }
};

module.exports = viewPRsCommand;

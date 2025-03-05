const chalk = require('chalk');

module.exports = { 
    info: chalk.blue.bold(`[INFO]`),
    err: chalk.red.bold(`[ERR]`),
    warn: chalk.yellow.bold(`[WARN]`),
    succ: chalk.green.bold(`[SUCC]`)
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCommand = void 0;
const node_path_1 = __importDefault(require("node:path"));
const commander_1 = require("commander");
const options_1 = require("../options");
const loadConfig_1 = require("../../playwright/loadConfig");
const logger_1 = require("../../utils/logger");
const env_1 = require("../../config/env");
const test_1 = require("./test");
const gen_1 = require("../../gen");
const logger = new logger_1.Logger({ verbose: true });
exports.exportCommand = new commander_1.Command('export')
    .description('Prints step definitions')
    .addOption(options_1.configOption)
    .option('--unused-steps', 'Output only unused steps')
    .action(async (opts) => {
    const { resolvedConfigFile } = await (0, loadConfig_1.loadConfig)(opts.config);
    logger.log(`Using config: ${node_path_1.default.relative(process.cwd(), resolvedConfigFile)}`);
    const configs = Object.values((0, env_1.getEnvConfigs)());
    (0, test_1.assertConfigsCount)(configs);
    if (opts.unusedSteps) {
        await showUnusedStepsForConfigs(configs);
    }
    else {
        await showStepsForConfigs(configs);
    }
});
async function showStepsForConfigs(configs) {
    // here we don't need workers (as in test command) because if some step files
    // are already in node cache, we collected them.
    const steps = new Set();
    const tasks = configs.map(async (config) => {
        const stepDefinitions = await new gen_1.TestFilesGenerator(config).extractSteps();
        stepDefinitions.forEach((s) => steps.add(`* ${getStepText(s)}`));
    });
    await Promise.all(tasks);
    logger.log(`List of all steps (${steps.size}):`);
    steps.forEach((stepText) => logger.log(stepText));
}
async function showUnusedStepsForConfigs(configs) {
    const steps = new Set();
    const tasks = configs.map(async (config) => {
        const stepDefinitions = await new gen_1.TestFilesGenerator(config).extractUnusedSteps();
        stepDefinitions.forEach((s) => steps.add(`* ${getStepText(s)}`));
    });
    await Promise.all(tasks);
    logger.log(`List of unused steps (${steps.size}):`);
    steps.forEach((stepText) => logger.log(stepText));
}
function getStepText({ pattern, keyword }) {
    // for Unknown return When as it looks the most suitable
    const keywordText = keyword === 'Unknown' ? 'When' : keyword;
    const patternText = typeof pattern === 'string' ? pattern : pattern.source;
    return `${keywordText} ${patternText}`;
}
//# sourceMappingURL=export.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envCommand = void 0;
const commander_1 = require("commander");
const options_1 = require("../options");
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = require("../../utils/logger");
const utils_1 = require("../../utils");
const loadConfig_1 = require("../../playwright/loadConfig");
const logger = new logger_1.Logger({ verbose: true });
exports.envCommand = new commander_1.Command('env')
    .description('Prints environment info')
    .addOption(options_1.configOption)
    .action((opts) => {
    logger.log(`Playwright-bdd environment info:\n`);
    logger.log(`platform: ${process.platform}`);
    logger.log(`node: ${process.version}`);
    showPackageVersion('playwright-bdd');
    showPackageVersion('@playwright/test');
    showPackageVersion('@cucumber/cucumber');
    showPlaywrightConfigPath(opts.config);
});
function showPackageVersion(packageName) {
    const version = (0, utils_1.getPackageVersion)(packageName);
    logger.log(`${packageName}: v${version}`);
}
function showPlaywrightConfigPath(cliConfigPath) {
    const resolvedConfigFile = (0, loadConfig_1.resolveConfigFile)(cliConfigPath);
    const relPath = node_path_1.default.relative(process.cwd(), resolvedConfigFile);
    logger.log(`Playwright config file: ${relPath}`);
}
//# sourceMappingURL=env.js.map
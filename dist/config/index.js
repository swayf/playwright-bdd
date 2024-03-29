"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCucumberConfig = exports.defineBddConfig = exports.defaults = void 0;
/**
 * BDD Config.
 */
const node_path_1 = __importDefault(require("node:path"));
const env_1 = require("./env");
const configDir_1 = require("./configDir");
const utils_1 = require("../utils");
exports.defaults = {
    outputDir: '.features-gen',
    verbose: false,
    examplesTitleFormat: 'Example #<_index_>',
    publishQuiet: true,
    quotes: 'double',
};
function defineBddConfig(inputConfig) {
    const isMainProcess = !process.env.TEST_WORKER_INDEX;
    const configDir = (0, configDir_1.getPlaywrightConfigDir)({ resolveAndSave: isMainProcess });
    const config = getConfig(configDir, inputConfig);
    // In main process store config in env to be accessible by workers
    if (isMainProcess) {
        (0, env_1.saveConfigToEnv)(config);
    }
    return config.outputDir;
}
exports.defineBddConfig = defineBddConfig;
function getConfig(configDir, inputConfig) {
    const config = Object.assign({}, exports.defaults, inputConfig);
    const featuresRoot = config.featuresRoot
        ? node_path_1.default.resolve(configDir, config.featuresRoot)
        : configDir;
    return {
        ...config,
        // important to resolve outputDir as it is used as unique key for input configs
        outputDir: node_path_1.default.resolve(configDir, config.outputDir),
        importTestFrom: resolveImportTestFrom(configDir, config.importTestFrom),
        featuresRoot,
    };
}
function extractCucumberConfig(config) {
    // todo: find more strict way to omit own config fields
    // see: https://bobbyhadz.com/blog/typescript-object-remove-property
    const omitProps = {
        outputDir: true,
        importTestFrom: true,
        verbose: true,
        skip: true,
        examplesTitleFormat: true,
        quotes: true,
        tags: true,
        featuresRoot: true,
        enrichReporterData: true,
    };
    const keys = Object.keys(omitProps);
    const cucumberConfig = { ...config };
    keys.forEach((key) => delete cucumberConfig[key]);
    stripPublishQuiet(cucumberConfig);
    return cucumberConfig;
}
exports.extractCucumberConfig = extractCucumberConfig;
function resolveImportTestFrom(configDir, importTestFrom) {
    if (importTestFrom) {
        const { file, varName } = typeof importTestFrom === 'string'
            ? { file: importTestFrom }
            : importTestFrom;
        return {
            file: node_path_1.default.resolve(configDir, file),
            varName,
        };
    }
}
function stripPublishQuiet(cucumberConfig) {
    const cucumberVersion = (0, utils_1.getPackageVersion)('@cucumber/cucumber');
    // Playwright-bdd supports Cucumber from v9+
    // publishQuiet was deprecated in Cucumber 9.4.0.
    // See: https://github.com/cucumber/cucumber-js/pull/2311
    // Remove publishQuite from Cucumber config to hide deprecation warning.
    // See: https://github.com/vitalets/playwright-bdd/pull/47
    if (!/^9\.[0123]\./.test(cucumberVersion)) {
        delete cucumberConfig.publishQuiet;
    }
}
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFilesGenerator = void 0;
/**
 * Generate playwright test files from Gherkin documents.
 */
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const testFile_1 = require("./testFile");
const loadConfig_1 = require("../cucumber/loadConfig");
const loadFeatures_1 = require("../cucumber/loadFeatures");
const loadSteps_1 = require("../cucumber/loadSteps");
const config_1 = require("../config");
const snippets_1 = require("../snippets");
const steps_1 = require("../steps/decorators/steps");
const transform_1 = require("../playwright/transform");
const configDir_1 = require("../config/configDir");
const logger_1 = require("../utils/logger");
const tag_expressions_1 = __importDefault(require("@cucumber/tag-expressions"));
const exit_1 = require("../utils/exit");
const createBdd_1 = require("../steps/createBdd");
const resolveFeaturePaths_1 = require("../cucumber/resolveFeaturePaths");
/* eslint-disable @typescript-eslint/no-non-null-assertion */
class TestFilesGenerator {
    constructor(config) {
        this.config = config;
        this.featuresLoader = new loadFeatures_1.FeaturesLoader();
        this.files = [];
        this.logger = new logger_1.Logger({ verbose: config.verbose });
        if (config.tags)
            this.tagsExpression = (0, tag_expressions_1.default)(config.tags);
    }
    async generate() {
        await (0, exit_1.withExitHandler)(async () => {
            await this.loadCucumberConfig();
            await Promise.all([this.loadFeatures(), this.loadSteps()]);
            this.buildFiles();
            await this.checkUndefinedSteps();
            this.checkImportTestFrom();
            await this.clearOutputDir();
            await this.saveFiles();
        });
    }
    async extractSteps() {
        await this.loadCucumberConfig();
        await this.loadSteps();
        return this.supportCodeLibrary.stepDefinitions;
    }
    // todo: combine with extractSteps
    async extractUnusedSteps() {
        await this.loadCucumberConfig();
        await Promise.all([this.loadFeatures(), this.loadSteps()]);
        this.buildFiles();
        return this.supportCodeLibrary.stepDefinitions.filter((stepDefinition) => {
            const isUsed = this.files.some((file) => file.usedStepDefinitions.has(stepDefinition));
            return !isUsed;
        });
    }
    async loadCucumberConfig() {
        const environment = { cwd: (0, configDir_1.getPlaywrightConfigDir)() };
        const { runConfiguration } = await (0, loadConfig_1.loadConfig)({
            provided: (0, config_1.extractCucumberConfig)(this.config),
        }, environment);
        this.runConfiguration = runConfiguration;
        this.warnForTsNodeRegister();
    }
    async loadFeatures() {
        const cwd = (0, configDir_1.getPlaywrightConfigDir)();
        const { defaultDialect } = this.runConfiguration.sources;
        const { featurePaths } = await (0, resolveFeaturePaths_1.resovleFeaturePaths)(this.runConfiguration, { cwd });
        this.logger.log(`Loading features from paths (${featurePaths.length}):`);
        featurePaths.forEach((featurePath) => this.logger.log(featurePath));
        if (featurePaths.length) {
            await this.featuresLoader.load(featurePaths, { relativeTo: cwd, defaultDialect });
            this.handleParseErrors();
        }
        this.logger.log(`Loaded features: ${this.featuresLoader.getDocumentsCount()}`);
    }
    async loadSteps() {
        const { requirePaths, importPaths } = this.runConfiguration.support;
        this.logger.log(`Loading steps from: ${requirePaths.concat(importPaths).join(', ')}`);
        const environment = { cwd: (0, configDir_1.getPlaywrightConfigDir)() };
        this.supportCodeLibrary = await (0, loadSteps_1.loadSteps)(this.runConfiguration, environment);
        await this.loadDecoratorSteps();
        this.logger.log(`Loaded steps: ${this.supportCodeLibrary.stepDefinitions.length}`);
    }
    async loadDecoratorSteps() {
        const { importTestFrom } = this.config;
        if (importTestFrom) {
            // require importTestFrom for case when it is not required by step definitions
            // possible re-require but it's not a problem as it is cached by Node.js
            await (0, transform_1.requireTransform)().requireOrImport(importTestFrom.file);
            (0, steps_1.appendDecoratorSteps)(this.supportCodeLibrary);
        }
    }
    buildFiles() {
        this.files = this.featuresLoader
            .getDocumentsWithPickles()
            .map((gherkinDocument) => {
            return new testFile_1.TestFile({
                gherkinDocument,
                supportCodeLibrary: this.supportCodeLibrary,
                // doc.uri is always relative to cwd (coming after cucumber handling)
                // see: https://github.com/cucumber/cucumber-js/blob/main/src/api/gherkin.ts#L51
                outputPath: this.getSpecPathByFeaturePath(gherkinDocument.uri),
                config: this.config,
                tagsExpression: this.tagsExpression,
            }).build();
        })
            .filter((file) => file.testCount > 0);
    }
    getSpecPathByFeaturePath(relFeaturePath) {
        const configDir = (0, configDir_1.getPlaywrightConfigDir)();
        const absFeaturePath = node_path_1.default.resolve(configDir, relFeaturePath);
        const relOutputPath = node_path_1.default.relative(this.config.featuresRoot, absFeaturePath);
        if (relOutputPath.startsWith('..')) {
            (0, exit_1.exit)(`All feature files should be located underneath featuresRoot.`, `Please change featuresRoot or paths in configuration.\n`, `featureFile: ${absFeaturePath}\n`, `featuresRoot: ${this.config.featuresRoot}\n`);
        }
        const absOutputPath = node_path_1.default.resolve(this.config.outputDir, relOutputPath);
        return `${absOutputPath}.spec.js`;
    }
    async checkUndefinedSteps() {
        const undefinedSteps = this.files.reduce((sum, file) => sum + file.undefinedSteps.length, 0);
        if (undefinedSteps > 0) {
            const snippets = new snippets_1.Snippets(this.files, this.runConfiguration, this.supportCodeLibrary);
            await snippets.print();
            (0, exit_1.exit)();
        }
    }
    checkImportTestFrom() {
        if (createBdd_1.hasCustomTest && !this.config.importTestFrom) {
            (0, exit_1.exit)(`When using custom "test" function in createBdd() you should`, `set "importTestFrom" config option that points to file exporting custom test.`);
        }
    }
    async saveFiles() {
        this.files.forEach((file) => {
            file.save();
            this.logger.log(`Generated: ${node_path_1.default.relative(process.cwd(), file.outputPath)}`);
        });
        this.logger.log(`Generated files: ${this.files.length}`);
    }
    async clearOutputDir() {
        const pattern = `${fast_glob_1.default.convertPathToPattern(this.config.outputDir)}/**/*.spec.js`;
        const testFiles = await (0, fast_glob_1.default)(pattern);
        this.logger.log(`Clearing output dir: ${testFiles.length} file(s)`);
        const tasks = testFiles.map((testFile) => promises_1.default.rm(testFile));
        await Promise.all(tasks);
    }
    warnForTsNodeRegister() {
        if ((0, loadSteps_1.hasTsNodeRegister)(this.runConfiguration)) {
            this.logger.warn(`WARNING: usage of requireModule: ['ts-node/register'] is not recommended for playwright-bdd.`, `Remove this option from defineBddConfig() and`, `Playwright's built-in loader will be used to compile TypeScript step definitions.`);
        }
    }
    handleParseErrors() {
        const { parseErrors } = this.featuresLoader;
        if (parseErrors.length) {
            const message = parseErrors
                .map((parseError) => {
                return `Parse error in "${parseError.source.uri}" ${parseError.message}`;
            })
                .join('\n');
            (0, exit_1.exit)(message);
        }
    }
}
exports.TestFilesGenerator = TestFilesGenerator;
//# sourceMappingURL=index.js.map
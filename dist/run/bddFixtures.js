"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBddAutoInjectFixture = exports.test = void 0;
const test_1 = require("@playwright/test");
const loadConfig_1 = require("../cucumber/loadConfig");
const loadSteps_1 = require("../cucumber/loadSteps");
const bddWorld_1 = require("./bddWorld");
const config_1 = require("../config");
const env_1 = require("../config/env");
const steps_1 = require("../steps/decorators/steps");
const configDir_1 = require("../config/configDir");
const scenario_1 = require("../hooks/scenario");
const worker_1 = require("../hooks/worker");
const StepInvoker_1 = require("./StepInvoker");
const testMeta_1 = require("../gen/testMeta");
const logger_1 = require("../utils/logger");
const enrichReporterData_1 = require("../config/enrichReporterData");
exports.test = test_1.test.extend({
    // load cucumber once per worker (auto-fixture)
    // todo: maybe remove caching in cucumber/loadConfig.ts and cucumber/loadSteps.ts
    // as we call it once per worker. Check generation phase.
    $cucumber: [
        async ({}, use, workerInfo) => {
            const config = (0, env_1.getConfigFromEnv)(workerInfo.project.testDir);
            const environment = { cwd: (0, configDir_1.getPlaywrightConfigDir)() };
            const { runConfiguration } = await (0, loadConfig_1.loadConfig)({
                provided: (0, config_1.extractCucumberConfig)(config),
            }, environment);
            const supportCodeLibrary = await (0, loadSteps_1.loadSteps)(runConfiguration, environment);
            (0, steps_1.appendDecoratorSteps)(supportCodeLibrary);
            const World = (0, bddWorld_1.getWorldConstructor)(supportCodeLibrary);
            await use({ runConfiguration, supportCodeLibrary, World, config });
        },
        { auto: true, scope: 'worker' },
    ],
    // $lang fixture can be overwritten in test file
    $lang: ({}, use) => use(''),
    // init $bddWorldFixtures with empty object, will be owerwritten in test file for cucumber-style
    $bddWorldFixtures: ({}, use) => use({}),
    $bddWorld: async ({ $tags, $test, $bddWorldFixtures, $cucumber, $lang, $testMeta, $uri }, use, testInfo) => {
        const { runConfiguration, supportCodeLibrary, World, config } = $cucumber;
        const world = new World({
            testInfo,
            supportCodeLibrary,
            $tags,
            $test,
            $bddWorldFixtures,
            lang: $lang,
            parameters: runConfiguration.runtime.worldParameters || {},
            log: () => logger_1.logger.warn(`world.log() is noop, please use world.testInfo.attach()`),
            attach: async () => logger_1.logger.warn(`world.attach() is noop, please use world.testInfo.attach()`),
        });
        await world.init();
        await use(world);
        await world.destroy();
        if ((0, enrichReporterData_1.getEnrichReporterData)(config)) {
            await world.$internal.bddData.attach($testMeta, $uri);
        }
    },
    Given: ({ $bddWorld }, use) => use(new StepInvoker_1.StepInvoker($bddWorld, 'Given').invoke),
    When: ({ $bddWorld }, use) => use(new StepInvoker_1.StepInvoker($bddWorld, 'When').invoke),
    Then: ({ $bddWorld }, use) => use(new StepInvoker_1.StepInvoker($bddWorld, 'Then').invoke),
    And: ({ $bddWorld }, use) => use(new StepInvoker_1.StepInvoker($bddWorld, 'And').invoke),
    But: ({ $bddWorld }, use) => use(new StepInvoker_1.StepInvoker($bddWorld, 'But').invoke),
    // init $testMetaMap with empty object, will be overwritten in each test file
    $testMetaMap: ({}, use) => use({}),
    // concrete test meta
    $testMeta: ({ $testMetaMap }, use, testInfo) => use((0, testMeta_1.getTestMeta)($testMetaMap, testInfo)),
    // concrete test tags
    $tags: ({ $testMeta }, use) => use($testMeta.tags || []),
    // init $test with base test, but it will be overwritten in test file
    $test: ({}, use) => use(test_1.test),
    // feature file uri, relative to configDir, will be overwritten in test file
    $uri: ({}, use) => use(''),
    // can be owerwritten in test file if there are scenario hooks
    $scenarioHookFixtures: ({}, use) => use({}),
    $before: [
        // Unused dependencies are important:
        // 1. $beforeAll / $afterAll: in pw < 1.39 worker-scoped auto-fixtures were called after test-scoped
        // 2. $after: to call after hooks in case of errors in before hooks
        async (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        { $scenarioHookFixtures, $bddWorld, $tags, $beforeAll, $afterAll, $after }, use, $testInfo) => {
            await (0, scenario_1.runScenarioHooks)('before', { $bddWorld, $tags, $testInfo, ...$scenarioHookFixtures });
            await use();
        },
        { auto: true },
    ],
    $after: [
        async ({ $scenarioHookFixtures, $bddWorld, $tags }, use, $testInfo) => {
            await use();
            await (0, scenario_1.runScenarioHooks)('after', { $bddWorld, $tags, $testInfo, ...$scenarioHookFixtures });
        },
        { auto: true },
    ],
    // can be owerwritten in test file if there are worker hooks
    $workerHookFixtures: [({}, use) => use({}), { scope: 'worker' }],
    $beforeAll: [
        // Important unused dependencies:
        // 1. $afterAll: in pw < 1.39 worker-scoped auto-fixtures are called in incorrect order
        // 2. $cucumber: to load hooks before this fixtures
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async ({ $workerHookFixtures, $cucumber }, use, $workerInfo) => {
            await (0, worker_1.runWorkerHooks)('beforeAll', { $workerInfo, ...$workerHookFixtures });
            await use();
        },
        { auto: true, scope: 'worker' },
    ],
    $afterAll: [
        async ({ $workerHookFixtures }, use, $workerInfo) => {
            await use();
            await (0, worker_1.runWorkerHooks)('afterAll', { $workerInfo, ...$workerHookFixtures });
        },
        { auto: true, scope: 'worker' },
    ],
});
const BDD_AUTO_INJECT_FIXTURES = ['$testInfo', '$test', '$tags'];
function isBddAutoInjectFixture(name) {
    return BDD_AUTO_INJECT_FIXTURES.includes(name);
}
exports.isBddAutoInjectFixture = isBddAutoInjectFixture;
//# sourceMappingURL=bddFixtures.js.map
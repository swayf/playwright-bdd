"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasTsNodeRegister = exports.findStepDefinition = exports.loadSteps = void 0;
const api_1 = require("@cucumber/cucumber/api");
const transform_1 = require("../playwright/transform");
const exit_1 = require("../utils/exit");
const cache = new Map();
async function loadSteps(runConfiguration, environment = {}) {
    const cacheKey = JSON.stringify(runConfiguration);
    let lib = cache.get(cacheKey);
    if (!lib) {
        // use Playwright's built-in hook to compile TypeScript steps
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const uninstall = !hasTsNodeRegister(runConfiguration) ? (0, transform_1.installTransform)() : () => { };
        lib = (0, api_1.loadSupport)(runConfiguration, environment).finally(() => uninstall());
        cache.set(cacheKey, lib);
    }
    return lib;
}
exports.loadSteps = loadSteps;
/**
 * Finds step definition by step text.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/assemble_test_cases.ts#L103
 *
 * Handling case when several step definitions found:
 * https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L313
 */
function findStepDefinition(supportCodeLibrary, stepText, file) {
    const matchedSteps = supportCodeLibrary.stepDefinitions.filter((step) => {
        return step.matchesStepName(stepText);
    });
    if (matchedSteps.length === 0)
        return;
    if (matchedSteps.length > 1)
        (0, exit_1.exit)([
            `Multiple step definitions matched for text: "${stepText}" (${file})`,
            // todo: print location of every step definition (as in cucumber)
            ...matchedSteps.map((s) => `  ${s.pattern}`),
        ].join('\n'));
    return matchedSteps[0];
}
exports.findStepDefinition = findStepDefinition;
function hasTsNodeRegister(runConfiguration) {
    return runConfiguration.support.requireModules.includes('ts-node/register');
}
exports.hasTsNodeRegister = hasTsNodeRegister;
//# sourceMappingURL=loadSteps.js.map
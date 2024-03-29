"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStepCode = exports.buildCucumberStepCode = exports.defineStep = void 0;
const cucumber_1 = require("@cucumber/cucumber");
const exit_1 = require("../utils/exit");
/**
 * Defines step by config.
 * Calls cucumber's Given(), When(), Then() under the hood.
 */
function defineStep(stepConfig) {
    const { keyword, pattern } = stepConfig;
    const cucumberDefineStepFn = getCucumberDefineStepFn(keyword);
    const code = buildCucumberStepCode(stepConfig);
    try {
        cucumberDefineStepFn(pattern, code);
    }
    catch (e) {
        // todo: detect that this is import from test file
        // and skip/delay registering cucumber steps until cucumber is loaded
        const isMissingCucumber = /Cucumber that isn't running/i.test(e.message);
        if (isMissingCucumber) {
            (0, exit_1.exit)(`Option "importTestFrom" should point to a separate file without step definitions`, `(e.g. without calls of Given, When, Then)`);
        }
        else {
            throw e;
        }
    }
}
exports.defineStep = defineStep;
function buildCucumberStepCode(stepConfig) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = function (...args) {
        // build the first argument (fixtures) for step fn
        const fixturesArg = Object.assign({}, this.$internal.currentStepFixtures, {
            $testInfo: this.testInfo,
            $test: this.test,
            $tags: this.tags,
        });
        return stepConfig.fn.call(this, fixturesArg, ...args);
    };
    code.stepConfig = stepConfig;
    return code;
}
exports.buildCucumberStepCode = buildCucumberStepCode;
function getStepCode(stepDefinition) {
    return stepDefinition.code;
}
exports.getStepCode = getStepCode;
function getCucumberDefineStepFn(keyword) {
    switch (keyword) {
        case 'Given':
            return cucumber_1.Given;
        case 'When':
            return cucumber_1.When;
        case 'Then':
            return cucumber_1.Then;
        default:
            return cucumber_1.defineStep;
    }
}
//# sourceMappingURL=defineStep.js.map
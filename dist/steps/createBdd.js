"use strict";
/**
 * Stuff related to writing steps in Playwright-style.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBdd = exports.hasCustomTest = void 0;
const bddFixtures_1 = require("../run/bddFixtures");
const testTypeImpl_1 = require("../playwright/testTypeImpl");
const defineStep_1 = require("./defineStep");
const exit_1 = require("../utils/exit");
const scenario_1 = require("../hooks/scenario");
const worker_1 = require("../hooks/worker");
const fixtureParameterNames_1 = require("../playwright/fixtureParameterNames");
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
// Global flag showing that custom test was passed.
// Used when checking 'importTestFrom' config option.
// todo: https://github.com/vitalets/playwright-bdd/issues/46
exports.hasCustomTest = false;
function createBdd(customTest, _CustomWorld) {
    if (!exports.hasCustomTest)
        exports.hasCustomTest = isCustomTest(customTest);
    const Given = defineStepCtor('Given', exports.hasCustomTest);
    const When = defineStepCtor('When', exports.hasCustomTest);
    const Then = defineStepCtor('Then', exports.hasCustomTest);
    const Step = defineStepCtor('Unknown', exports.hasCustomTest);
    const Before = (0, scenario_1.scenarioHookFactory)('before');
    const After = (0, scenario_1.scenarioHookFactory)('after');
    const BeforeAll = (0, worker_1.workerHookFactory)('beforeAll');
    const AfterAll = (0, worker_1.workerHookFactory)('afterAll');
    return { Given, When, Then, Step, Before, After, BeforeAll, AfterAll };
}
exports.createBdd = createBdd;
function defineStepCtor(keyword, hasCustomTest) {
    return (pattern, fn) => {
        (0, defineStep_1.defineStep)({
            keyword,
            pattern,
            fn,
            hasCustomTest,
        });
        return (fixtures, ...args) => {
            assertStepIsCalledWithRequiredFixtures(pattern, fn, fixtures);
            return fn(fixtures, ...args);
        };
    };
}
function isCustomTest(customTest) {
    if (!customTest || customTest === bddFixtures_1.test)
        return false;
    assertTestHasBddFixtures(customTest);
    return true;
}
function assertTestHasBddFixtures(customTest) {
    if (!(0, testTypeImpl_1.isTestContainsSubtest)(customTest, bddFixtures_1.test)) {
        (0, exit_1.exit)(`createBdd() should use 'test' extended from "playwright-bdd"`);
    }
}
function assertStepIsCalledWithRequiredFixtures(pattern, fn, fixtures) {
    const fixtureNames = (0, fixtureParameterNames_1.fixtureParameterNames)(fn);
    const missingFixtures = fixtureNames.filter((fixtureName) => !Object.prototype.hasOwnProperty.call(fixtures, fixtureName));
    if (missingFixtures.length) {
        throw new Error([
            `Invocation of step "${pattern}" from another step does not pass all required fixtures.`,
            `Missings fixtures: ${missingFixtures.join(', ')}`,
        ].join(' '));
    }
}
//# sourceMappingURL=createBdd.js.map
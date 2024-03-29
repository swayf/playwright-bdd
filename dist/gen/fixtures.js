"use strict";
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFixtureNamesFromFnBodyMemo = exports.extractFixtureNames = void 0;
const fixtureParameterNames_1 = require("../playwright/fixtureParameterNames");
const bddFixtures_1 = require("../run/bddFixtures");
const exit_1 = require("../utils/exit");
const bodyFixturesSymbol = Symbol('bodyFixtures');
/**
 * This function is used for playwright-style steps and decorators.
 * It extracts fixtures names from first parameter of function
 * using Playwright's helper.
 */
function extractFixtureNames(fn) {
    return (0, fixtureParameterNames_1.fixtureParameterNames)(fn).filter((name) => !(0, bddFixtures_1.isBddAutoInjectFixture)(name));
}
exports.extractFixtureNames = extractFixtureNames;
/**
 * This function is used for cucumber-style steps.
 * It looks for `this.useFixture('xxx')` entries in function body
 * and extracts fixtures names from it.
 */
function extractFixtureNamesFromFnBodyMemo(fn) {
    if (typeof fn !== 'function')
        return [];
    const fnWithFixtures = fn;
    if (!fnWithFixtures[bodyFixturesSymbol]) {
        fnWithFixtures[bodyFixturesSymbol] = extractFixtureNamesFromFnBody(fn).filter((name) => !(0, bddFixtures_1.isBddAutoInjectFixture)(name));
    }
    return fnWithFixtures[bodyFixturesSymbol];
}
exports.extractFixtureNamesFromFnBodyMemo = extractFixtureNamesFromFnBodyMemo;
function extractFixtureNamesFromFnBody(fn) {
    const matches = fn.toString().matchAll(/this\.useFixture\((.+)\)/gi) || [];
    return [...matches].map((match) => getFixtureName(match[1]));
}
function getFixtureName(arg) {
    if (!/^['"`]/.test(arg)) {
        // todo: log file location with incorrect useFixture
        (0, exit_1.exit)('this.useFixture() can accept only static string as an argument.');
    }
    if (arg.startsWith('`') && arg.includes('${')) {
        (0, exit_1.exit)('this.useFixture() can accept only static string as an argument.');
    }
    return arg.replace(/['"`]/g, '');
}
//# sourceMappingURL=fixtures.js.map
"use strict";
/**
 * Define steps via decorators.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendDecoratorSteps = exports.linkStepsWithPomNode = exports.createStepDecorator = void 0;
/* eslint-disable @typescript-eslint/ban-types */
const bddFixtures_1 = require("../../run/bddFixtures");
const buildStepDefinition_1 = require("../../cucumber/buildStepDefinition");
const defineStep_1 = require("../defineStep");
// initially we sotre step data inside method,
// and then extract it in @Fixture decorator call
const decoratedStepSymbol = Symbol('decoratedStep');
// global list of all decorator steps
const decoratedSteps = new Set();
/**
 * Creates @Given, @When, @Then decorators.
 */
function createStepDecorator(keyword) {
    return (pattern) => {
        // context parameter is required for decorator by TS even though it's not used
        return (method, _context) => {
            saveStepConfigToMethod(method, {
                keyword,
                pattern,
                fn: method,
                hasCustomTest: true,
            });
        };
    };
}
exports.createStepDecorator = createStepDecorator;
function linkStepsWithPomNode(Ctor, pomNode) {
    if (!Ctor?.prototype)
        return;
    const propertyDescriptors = Object.getOwnPropertyDescriptors(Ctor.prototype);
    return Object.values(propertyDescriptors).forEach((descriptor) => {
        const stepConfig = getStepConfigFromMethod(descriptor);
        if (!stepConfig)
            return;
        stepConfig.pomNode = pomNode;
        decoratedSteps.add(stepConfig);
    });
}
exports.linkStepsWithPomNode = linkStepsWithPomNode;
/**
 * Append decorator steps to Cucumber's supportCodeLibrary.
 */
function appendDecoratorSteps(supportCodeLibrary) {
    decoratedSteps.forEach((stepConfig) => {
        const { keyword, pattern, fn } = stepConfig;
        stepConfig.fn = (fixturesArg, ...args) => {
            const fixture = getFirstNonAutoInjectFixture(fixturesArg, stepConfig);
            return fn.call(fixture, ...args);
        };
        const code = (0, defineStep_1.buildCucumberStepCode)(stepConfig);
        const stepDefinition = (0, buildStepDefinition_1.buildStepDefinition)({
            keyword,
            pattern,
            code,
            line: 0, // not used in playwright-bdd
            options: {}, // not used in playwright-bdd
            uri: '', // not used in playwright-bdd
        }, supportCodeLibrary);
        supportCodeLibrary.stepDefinitions.push(stepDefinition);
    });
    decoratedSteps.clear();
    // todo: fill supportCodeLibrary.originalCoordinates as it is used in snippets?
}
exports.appendDecoratorSteps = appendDecoratorSteps;
function getFirstNonAutoInjectFixture(fixturesArg, stepConfig) {
    // there should be exatcly one suitable fixture in fixturesArg
    const fixtureNames = Object.keys(fixturesArg).filter((fixtureName) => !(0, bddFixtures_1.isBddAutoInjectFixture)(fixtureName));
    if (fixtureNames.length === 0) {
        throw new Error(`No suitable fixtures found for decorator step "${stepConfig.pattern}"`);
    }
    if (fixtureNames.length > 1) {
        throw new Error(`Several suitable fixtures found for decorator step "${stepConfig.pattern}"`);
    }
    return fixturesArg[fixtureNames[0]];
}
function saveStepConfigToMethod(method, stepConfig) {
    method[decoratedStepSymbol] = stepConfig;
}
function getStepConfigFromMethod(descriptor) {
    // filter out getters / setters
    return typeof descriptor.value === 'function'
        ? descriptor.value[decoratedStepSymbol]
        : undefined;
}
//# sourceMappingURL=steps.js.map
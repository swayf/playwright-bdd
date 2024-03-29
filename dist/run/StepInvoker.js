"use strict";
/**
 * Class to invoke step in playwright runner.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepInvoker = void 0;
const loadSteps_1 = require("../cucumber/loadSteps");
const getLocationInFile_1 = require("../playwright/getLocationInFile");
const testTypeImpl_1 = require("../playwright/testTypeImpl");
const defineStep_1 = require("../steps/defineStep");
const lang_1 = require("../config/lang");
class StepInvoker {
    constructor(world, keyword) {
        this.world = world;
        this.keyword = keyword;
        this.invoke = this.invoke.bind(this);
    }
    /**
     * Invokes particular step.
     * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L299
     */
    async invoke(stepText, argument, stepFixtures) {
        this.world.$internal.currentStepFixtures = stepFixtures || {};
        const stepDefinition = this.getStepDefinition(stepText);
        // Get location of step call in generated test file.
        // This call must be exactly here to have correct call stack (before async calls)
        const location = (0, getLocationInFile_1.getLocationInFile)(this.world.testInfo.file);
        const stepTitle = this.getStepTitle(stepText);
        const code = (0, defineStep_1.getStepCode)(stepDefinition);
        const parameters = await this.getStepParameters(stepDefinition, stepText, argument || undefined);
        this.world.$internal.bddData.registerStep(stepDefinition, stepText, location);
        await (0, testTypeImpl_1.runStepWithCustomLocation)(this.world.test, stepTitle, location, () => code.apply(this.world, parameters));
    }
    getStepDefinition(text) {
        const stepDefinition = (0, loadSteps_1.findStepDefinition)(this.world.options.supportCodeLibrary, text, this.world.testInfo.file);
        if (!stepDefinition) {
            throw new Error(`Undefined step: "${text}"`);
        }
        return stepDefinition;
    }
    async getStepParameters(stepDefinition, text, argument) {
        // see: https://github.com/cucumber/cucumber-js/blob/main/src/models/step_definition.ts#L25
        const { parameters } = await stepDefinition.getInvocationParameters({
            hookParameter: {},
            // only text and argument are needed
            step: { text, argument },
            world: this.world,
        });
        return parameters;
    }
    getStepTitle(text) {
        // Currently prepend keyword only for English.
        // For other langs it's more complex as we need to pass original keyword from step.
        return (0, lang_1.isEnglish)(this.world.options.lang) ? `${this.keyword} ${text}` : text;
    }
}
exports.StepInvoker = StepInvoker;
//# sourceMappingURL=StepInvoker.js.map
import { CucumberStepFunction, StepConfig } from './stepConfig';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
/**
 * Defines step by config.
 * Calls cucumber's Given(), When(), Then() under the hood.
 */
export declare function defineStep(stepConfig: StepConfig): void;
export declare function buildCucumberStepCode(stepConfig: StepConfig): CucumberStepFunction;
export declare function getStepCode(stepDefinition: StepDefinition): CucumberStepFunction;
//# sourceMappingURL=defineStep.d.ts.map
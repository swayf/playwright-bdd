/**
 * Playwright-bdd's step config.
 */
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { DefineStepPattern, TestStepFunction } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { BddWorld } from '../run/bddWorld';
import { PomNode } from './decorators/class';
export type StepConfig = {
    keyword: GherkinStepKeyword;
    pattern: DefineStepPattern;
    fn: Function;
    hasCustomTest: boolean;
    pomNode?: PomNode;
};
export type CucumberStepFunction = TestStepFunction<BddWorld> & {
    stepConfig?: StepConfig;
};
export declare function getStepConfig(step: StepDefinition): StepConfig | undefined;
export declare function isDecorator(stepConfig?: StepConfig): stepConfig is StepConfig & {
    pomNode: PomNode;
};
/**
 * Cucumber-style steps don't have stepConfig
 * b/c they created directly via cucumber's Given, When, Then.
 */
export declare function isPlaywrightStyle(stepConfig?: StepConfig): stepConfig is StepConfig;
//# sourceMappingURL=stepConfig.d.ts.map
/**
 * Define steps via decorators.
 */
import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { GherkinStepKeyword } from '@cucumber/cucumber/lib/models/gherkin_step_keyword';
import { PomNode } from './class';
import { ISupportCodeLibrary } from '../../cucumber/types';
/**
 * Creates @Given, @When, @Then decorators.
 */
export declare function createStepDecorator(keyword: GherkinStepKeyword): (pattern: DefineStepPattern) => (method: Function, _context: ClassMethodDecoratorContext) => void;
export declare function linkStepsWithPomNode(Ctor: Function, pomNode: PomNode): void;
/**
 * Append decorator steps to Cucumber's supportCodeLibrary.
 */
export declare function appendDecoratorSteps(supportCodeLibrary: ISupportCodeLibrary): void;
//# sourceMappingURL=steps.d.ts.map
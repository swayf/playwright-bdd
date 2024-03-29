/**
 * Cucumber types.
 * Use types from here to be independent from changes in Cucumber.
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/support_code_library_builder/types.ts#L153
 */
import type { ParameterTypeRegistry } from '@cucumber/cucumber-expressions';
import type StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
export interface ISupportCodeLibrary {
    parameterTypeRegistry: ParameterTypeRegistry;
    stepDefinitions: StepDefinition[];
    World: any;
    originalCoordinates: ISupportCodeCoordinates;
}
interface ISupportCodeCoordinates {
    requireModules: string[];
    requirePaths: string[];
    importPaths: string[];
}
export {};
//# sourceMappingURL=types.d.ts.map
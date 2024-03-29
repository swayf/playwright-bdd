import { IRunConfiguration, IRunEnvironment } from '@cucumber/cucumber/api';
import { ISupportCodeLibrary } from './types';
export declare function loadSteps(runConfiguration: IRunConfiguration, environment?: IRunEnvironment): Promise<ISupportCodeLibrary>;
/**
 * Finds step definition by step text.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/runtime/assemble_test_cases.ts#L103
 *
 * Handling case when several step definitions found:
 * https://github.com/cucumber/cucumber-js/blob/main/src/runtime/test_case_runner.ts#L313
 */
export declare function findStepDefinition(supportCodeLibrary: ISupportCodeLibrary, stepText: string, file: string): import("@cucumber/cucumber/lib/models/step_definition").default | undefined;
export declare function hasTsNodeRegister(runConfiguration: IRunConfiguration): boolean;
//# sourceMappingURL=loadSteps.d.ts.map
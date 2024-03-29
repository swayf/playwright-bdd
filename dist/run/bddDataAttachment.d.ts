/**
 * Bdd data is a special attachment with test meta data, needed for Cucumber reporting.
 */
import { StepMatchArgumentsList } from '@cucumber/messages';
import { BddWorld } from './bddWorld';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { TestMeta } from '../gen/testMeta';
import { TestResult } from '@playwright/test/reporter';
import { PlaywrightLocation, PwAttachment } from '../playwright/types';
export type BddDataAttachment = {
    uri: string;
    pickleLocation: string;
    steps: BddDataStep[];
};
export type BddDataStep = {
    pwStepLocation: string;
    stepMatchArgumentsLists: readonly StepMatchArgumentsList[];
};
export declare class BddData {
    private world;
    private steps;
    constructor(world: BddWorld);
    registerStep(stepDefinition: StepDefinition, stepText: string, pwStepLocation: PlaywrightLocation): void;
    attach(testMeta: TestMeta, uri: string): Promise<void>;
}
export declare function getBddDataFromTestResult(result: TestResult): BddDataAttachment | undefined;
export declare function isBddDataAttachment(attachment: PwAttachment): boolean;
//# sourceMappingURL=bddDataAttachment.d.ts.map
import { TestInfo } from '@playwright/test';
import { BddWorld, BddWorldFixtures } from './bddWorld';
import { BDDConfig } from '../config';
import { TestTypeCommon } from '../playwright/types';
import { IRunConfiguration } from '@cucumber/cucumber/api';
import { StepInvoker } from './StepInvoker';
import { ISupportCodeLibrary } from '../cucumber/types';
import { TestMeta, TestMetaMap } from '../gen/testMeta';
export type BddFixtures = {
    $bddWorldFixtures: BddWorldFixtures;
    $bddWorld: BddWorld;
    Given: StepInvoker['invoke'];
    When: StepInvoker['invoke'];
    Then: StepInvoker['invoke'];
    And: StepInvoker['invoke'];
    But: StepInvoker['invoke'];
    $testMetaMap: TestMetaMap;
    $testMeta: TestMeta;
    $tags: string[];
    $test: TestTypeCommon;
    $uri: string;
    $scenarioHookFixtures: Record<string, unknown>;
    $before: void;
    $after: void;
    $lang: string;
};
type BddFixturesWorker = {
    $cucumber: {
        runConfiguration: IRunConfiguration;
        supportCodeLibrary: ISupportCodeLibrary;
        World: typeof BddWorld;
        config: BDDConfig;
    };
    $workerHookFixtures: Record<string, unknown>;
    $beforeAll: void;
    $afterAll: void;
};
export declare const test: import("@playwright/test").TestType<import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions & BddFixtures, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions & BddFixturesWorker>;
/** these fixtures automatically injected into every step call */
export type BddAutoInjectFixtures = Pick<BddFixtures, '$test' | '$tags'> & {
    $testInfo: TestInfo;
};
export declare function isBddAutoInjectFixture(name: string): boolean;
export {};
//# sourceMappingURL=bddFixtures.d.ts.map
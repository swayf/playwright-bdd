/**
 * Stuff related to writing steps in Playwright-style.
 */
import { DefineStepPattern } from '@cucumber/cucumber/lib/support_code_library_builder/types';
import { BuiltInFixtures, BuiltInFixturesWorker, FixturesArg, KeyValue } from '../playwright/types';
import { TestType } from '@playwright/test';
import { BddAutoInjectFixtures } from '../run/bddFixtures';
import { BddWorld } from '../run/bddWorld';
export declare let hasCustomTest: boolean;
export declare function createBdd<T extends KeyValue = BuiltInFixtures, W extends KeyValue = BuiltInFixturesWorker, World extends BddWorld = BddWorld>(customTest?: TestType<T, W> | null, _CustomWorld?: new (...args: any[]) => World): {
    Given: <Args extends any[]>(pattern: DefineStepPattern, fn: StepFunction<T, W, Args>) => (fixtures: Partial<StepFunctionFixturesArg<T, W>>, ...args: Args) => unknown;
    When: <Args extends any[]>(pattern: DefineStepPattern, fn: StepFunction<T, W, Args>) => (fixtures: Partial<StepFunctionFixturesArg<T, W>>, ...args: Args) => unknown;
    Then: <Args extends any[]>(pattern: DefineStepPattern, fn: StepFunction<T, W, Args>) => (fixtures: Partial<StepFunctionFixturesArg<T, W>>, ...args: Args) => unknown;
    Step: <Args extends any[]>(pattern: DefineStepPattern, fn: StepFunction<T, W, Args>) => (fixtures: Partial<StepFunctionFixturesArg<T, W>>, ...args: Args) => unknown;
    Before: (...args: [(this: World, fixtures: T & W & {
        $bddWorld: World;
        $tags: string[];
        $testInfo: import("@playwright/test").TestInfo;
    }) => unknown] | [string, (this: World, fixtures: T & W & {
        $bddWorld: World;
        $tags: string[];
        $testInfo: import("@playwright/test").TestInfo;
    }) => unknown] | [{
        name?: string | undefined;
        tags?: string | undefined;
        timeout?: number | undefined;
    }, (this: World, fixtures: T & W & {
        $bddWorld: World;
        $tags: string[];
        $testInfo: import("@playwright/test").TestInfo;
    }) => unknown]) => void;
    After: (...args: [(this: World, fixtures: T & W & {
        $bddWorld: World;
        $tags: string[];
        $testInfo: import("@playwright/test").TestInfo;
    }) => unknown] | [string, (this: World, fixtures: T & W & {
        $bddWorld: World;
        $tags: string[];
        $testInfo: import("@playwright/test").TestInfo;
    }) => unknown] | [{
        name?: string | undefined;
        tags?: string | undefined;
        timeout?: number | undefined;
    }, (this: World, fixtures: T & W & {
        $bddWorld: World;
        $tags: string[];
        $testInfo: import("@playwright/test").TestInfo;
    }) => unknown]) => void;
    BeforeAll: (...args: [(fixtures: W & {
        $workerInfo: import("@playwright/test").WorkerInfo;
    }) => unknown] | [{
        timeout?: number | undefined;
    }, (fixtures: W & {
        $workerInfo: import("@playwright/test").WorkerInfo;
    }) => unknown]) => void;
    AfterAll: (...args: [(fixtures: W & {
        $workerInfo: import("@playwright/test").WorkerInfo;
    }) => unknown] | [{
        timeout?: number | undefined;
    }, (fixtures: W & {
        $workerInfo: import("@playwright/test").WorkerInfo;
    }) => unknown]) => void;
};
type StepFunctionFixturesArg<T extends KeyValue, W extends KeyValue> = FixturesArg<T, W> & BddAutoInjectFixtures;
type StepFunction<T extends KeyValue, W extends KeyValue, Args extends any[]> = (fixtures: StepFunctionFixturesArg<T, W>, ...args: Args) => unknown;
export {};
//# sourceMappingURL=createBdd.d.ts.map
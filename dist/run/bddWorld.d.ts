import { APIRequestContext, Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';
import { Fixtures, TestTypeCommon } from '../playwright/types';
import { ISupportCodeLibrary } from '../cucumber/types';
import { BddWorldInternal } from './bddWorldInternal';
export type BddWorldFixtures = {
    page: Page;
    context: BrowserContext;
    browser: Browser;
    browserName: string;
    request: APIRequestContext;
};
export type BddWorldOptions<ParametersType = any, TestType extends TestTypeCommon = TestTypeCommon> = IWorldOptions<ParametersType> & {
    testInfo: TestInfo;
    supportCodeLibrary: ISupportCodeLibrary;
    $tags: string[];
    $test: TestType;
    $bddWorldFixtures: BddWorldFixtures;
    lang: string;
};
export declare class BddWorld<ParametersType = any, TestType extends TestTypeCommon = TestTypeCommon> extends CucumberWorld<ParametersType> {
    options: BddWorldOptions<ParametersType, TestType>;
    $internal: BddWorldInternal;
    constructor(options: BddWorldOptions<ParametersType, TestType>);
    /**
     * Use particular fixture in cucumber-style steps.
     *
     * Note: TS does not support partial generic inference,
     * that's why we can't use this.useFixture<typeof test>('xxx');
     * The solution is to pass TestType as a generic to BddWorld
     * and call useFixture without explicit generic params.
     * Finally, it looks even better as there is no need to pass `typeof test`
     * in every `this.useFixture` call.
     *
     * The downside - it's impossible to pass fixtures type directly to `this.useFixture`
     * like it's done in @Fixture decorator.
     *
     * See: https://stackoverflow.com/questions/45509621/specify-only-first-type-argument
     * See: https://github.com/Microsoft/TypeScript/pull/26349
     */
    useFixture<K extends keyof Fixtures<TestType>>(fixtureName: K): Fixtures<TestType>[K];
    get page(): Page;
    get context(): BrowserContext;
    get browser(): Browser;
    get browserName(): string;
    get request(): APIRequestContext;
    get testInfo(): TestInfo;
    get tags(): string[];
    get test(): TestType;
    init(): Promise<void>;
    destroy(): Promise<void>;
}
export declare function getWorldConstructor(supportCodeLibrary: ISupportCodeLibrary): typeof BddWorld;
//# sourceMappingURL=bddWorld.d.ts.map
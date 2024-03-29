/**
 * Helper to format Playwright test file.
 */
import { PickleStepArgument } from '@cucumber/messages';
import { BDDConfig } from '../config';
import { TestNode } from './testNode';
import { TestMetaBuilder } from './testMeta';
export type ImportTestFrom = {
    file: string;
    varName?: string;
};
export declare class Formatter {
    private config;
    constructor(config: BDDConfig);
    fileHeader(featureUri: string, importTestFrom?: ImportTestFrom): string[];
    suite(node: TestNode, children: string[]): string[];
    beforeEach(fixtures: Set<string>, children: string[]): string[];
    test(node: TestNode, fixtures: Set<string>, children: string[]): string[];
    step(keyword: string, text: string, argument?: PickleStepArgument, fixtureNames?: string[]): string;
    missingStep(keyword: string, text: string): string;
    technicalSection(testMetaBuilder: TestMetaBuilder, featureUri: string, fixtures: string[]): string[];
    bddWorldFixtures(): string[];
    scenarioHookFixtures(fixtureNames: string[]): string[];
    workerHookFixtures(fixtureNames: string[]): string[];
    langFixture(lang: string): string[];
    private getSubFn;
    /**
     * Apply this function only to string literals (mostly titles here).
     * Objects and arrays are handled with JSON.strinigfy,
     * b/c object keys can't be in backticks.
     * See: https://stackoverflow.com/questions/33194138/template-string-as-object-property-name
     */
    private quoted;
}
//# sourceMappingURL=formatter.d.ts.map
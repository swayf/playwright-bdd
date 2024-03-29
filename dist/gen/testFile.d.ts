/**
 * Generate Playwright test file for feature.
 */
import { Step, PickleStep } from '@cucumber/messages';
import { BDDConfig } from '../config';
import { KeywordType } from '@cucumber/cucumber/lib/formatter/helpers/index';
import parseTagsExpression from '@cucumber/tag-expressions';
import StepDefinition from '@cucumber/cucumber/lib/models/step_definition';
import { ISupportCodeLibrary } from '../cucumber/types';
import { GherkinDocumentWithPickles } from '../cucumber/loadFeatures';
type TestFileOptions = {
    gherkinDocument: GherkinDocumentWithPickles;
    supportCodeLibrary: ISupportCodeLibrary;
    outputPath: string;
    config: BDDConfig;
    tagsExpression?: ReturnType<typeof parseTagsExpression>;
};
export type UndefinedStep = {
    keywordType: KeywordType;
    step: Step;
    pickleStep: PickleStep;
};
export declare class TestFile {
    private options;
    private lines;
    private i18nKeywordsMap?;
    private formatter;
    private testMetaBuilder;
    private hasCucumberStyle;
    hasCustomTest: boolean;
    undefinedSteps: UndefinedStep[];
    featureUri: string;
    usedStepDefinitions: Set<StepDefinition>;
    constructor(options: TestFileOptions);
    get gherkinDocument(): GherkinDocumentWithPickles;
    get pickles(): import("../cucumber/loadFeatures").PickleWithLocation[];
    get content(): string;
    get language(): string;
    get isEnglish(): boolean;
    get config(): BDDConfig;
    get outputPath(): string;
    get testCount(): number;
    build(): this;
    save(): void;
    private getFileHeader;
    private loadI18nKeywords;
    private getFeatureUri;
    private getRelativeImportTestFrom;
    private getTechnicalSection;
    private getRootSuite;
    /**
     * Generate test.describe suite for root Feature or Rule
     */
    private getSuite;
    private getSuiteChild;
    private getScenarioLines;
    /**
     * Generate test.beforeEach for Background
     */
    private getBeforeEach;
    /**
     * Generate test.describe suite for Scenario Outline
     */
    private getOutlineSuite;
    /**
     * Generate test from Examples row of Scenario Outline
     */
    private getOutlineTest;
    /**
     * Generate test from Scenario
     */
    private getTest;
    /**
     * Generate test steps
     */
    private getSteps;
    /**
     * Generate step for Given, When, Then
     */
    private getStep;
    private getMissingStep;
    /**
     * Returns pickle for scenario.
     * Pickle is executable entity including background and steps with example values.
     */
    private findPickle;
    /**
     * Returns pickleStep for ast step.
     * PickleStep contains step text with inserted example values.
     *
     * Note:
     * When searching for pickleStep iterate all pickles in a file
     * b/c for background steps there is no own pickle.
     * This can be optimized: pass optional 'pickle' parameter
     * and search only inside it if it exists.
     * But this increases code complexity, and performance impact seems to be minimal
     * b/c number of pickles inside feature file is not very big.
     */
    private findPickleStep;
    private getStepEnglishKeyword;
    private getStepFixtureNames;
    private getDecoratorStep;
    private getOutlineTestTitle;
    private getExamplesTitleFormat;
    private getExamplesTitleFormatFromComment;
    private getExamplesTitleFormatFromScenarioName;
    private skipByTagsExpression;
    private isOutline;
    private getEnglishKeyword;
}
export {};
//# sourceMappingURL=testFile.d.ts.map
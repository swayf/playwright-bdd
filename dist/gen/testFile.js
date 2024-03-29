"use strict";
/**
 * Generate Playwright test file for feature.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFile = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const formatter_1 = require("./formatter");
const i18n_1 = require("./i18n");
const loadSteps_1 = require("../cucumber/loadSteps");
const index_1 = require("@cucumber/cucumber/lib/formatter/helpers/index");
const utils_1 = require("../utils");
const testPoms_1 = require("./testPoms");
const testNode_1 = require("./testNode");
const stepConfig_1 = require("../steps/stepConfig");
const exit_1 = require("../utils/exit");
const fixtures_1 = require("./fixtures");
const scenario_1 = require("../hooks/scenario");
const worker_1 = require("../hooks/worker");
const lang_1 = require("../config/lang");
const testMeta_1 = require("./testMeta");
class TestFile {
    constructor(options) {
        this.options = options;
        this.lines = [];
        this.hasCucumberStyle = false;
        this.hasCustomTest = false;
        this.undefinedSteps = [];
        this.usedStepDefinitions = new Set();
        this.formatter = new formatter_1.Formatter(options.config);
        this.testMetaBuilder = new testMeta_1.TestMetaBuilder();
        this.featureUri = this.getFeatureUri();
    }
    get gherkinDocument() {
        return this.options.gherkinDocument;
    }
    get pickles() {
        return this.gherkinDocument.pickles;
    }
    get content() {
        return this.lines.join('\n');
    }
    get language() {
        return this.gherkinDocument.feature?.language || lang_1.LANG_EN;
    }
    get isEnglish() {
        return (0, lang_1.isEnglish)(this.language);
    }
    get config() {
        return this.options.config;
    }
    get outputPath() {
        return this.options.outputPath;
    }
    get testCount() {
        return this.testMetaBuilder.testCount;
    }
    build() {
        if (!this.pickles.length)
            return this;
        this.loadI18nKeywords();
        this.lines = [
            ...this.getFileHeader(), // prettier-ignore
            ...this.getRootSuite(),
            ...this.getTechnicalSection(),
        ];
        return this;
    }
    save() {
        const dir = node_path_1.default.dirname(this.outputPath);
        if (!node_fs_1.default.existsSync(dir))
            node_fs_1.default.mkdirSync(dir, { recursive: true });
        node_fs_1.default.writeFileSync(this.outputPath, this.content);
    }
    getFileHeader() {
        const importTestFrom = this.getRelativeImportTestFrom();
        return this.formatter.fileHeader(this.featureUri, importTestFrom);
    }
    loadI18nKeywords() {
        if (!this.isEnglish) {
            this.i18nKeywordsMap = (0, i18n_1.getKeywordsMap)(this.language);
        }
    }
    getFeatureUri() {
        const { uri } = this.gherkinDocument;
        if (!uri)
            throw new Error(`Document without uri: ${this.gherkinDocument.feature?.name}`);
        return uri;
    }
    getRelativeImportTestFrom() {
        const { importTestFrom } = this.config;
        if (!importTestFrom)
            return;
        const { file, varName } = importTestFrom;
        const dir = node_path_1.default.dirname(this.outputPath);
        return {
            file: node_path_1.default.relative(dir, file),
            varName,
        };
    }
    getTechnicalSection() {
        return this.formatter.technicalSection(this.testMetaBuilder, this.featureUri, [
            ...(!this.isEnglish ? this.formatter.langFixture(this.language) : []),
            ...((0, scenario_1.hasScenarioHooks)() || this.hasCucumberStyle ? this.formatter.bddWorldFixtures() : []),
            ...this.formatter.scenarioHookFixtures((0, scenario_1.getScenarioHooksFixtures)()),
            ...this.formatter.workerHookFixtures((0, worker_1.getWorkerHooksFixtures)()),
        ]);
    }
    getRootSuite() {
        const { feature } = this.gherkinDocument;
        if (!feature)
            throw new Error(`Document without feature.`);
        return this.getSuite(feature);
    }
    /**
     * Generate test.describe suite for root Feature or Rule
     */
    getSuite(feature, parent) {
        const node = new testNode_1.TestNode(feature, parent);
        if (node.isSkipped())
            return this.formatter.suite(node, []);
        const lines = [];
        feature.children.forEach((child) => lines.push(...this.getSuiteChild(child, node)));
        return this.formatter.suite(node, lines);
    }
    getSuiteChild(child, parent) {
        if ('rule' in child && child.rule)
            return this.getSuite(child.rule, parent);
        if (child.background)
            return this.getBeforeEach(child.background, parent);
        if (child.scenario)
            return this.getScenarioLines(child.scenario, parent);
        throw new Error(`Empty child: ${JSON.stringify(child)}`);
    }
    getScenarioLines(scenario, parent) {
        return this.isOutline(scenario)
            ? this.getOutlineSuite(scenario, parent)
            : this.getTest(scenario, parent);
    }
    /**
     * Generate test.beforeEach for Background
     */
    getBeforeEach(bg, parent) {
        const node = new testNode_1.TestNode({ name: 'background', tags: [] }, parent);
        const { fixtures, lines } = this.getSteps(bg, node.tags);
        return this.formatter.beforeEach(fixtures, lines);
    }
    /**
     * Generate test.describe suite for Scenario Outline
     */
    getOutlineSuite(scenario, parent) {
        const node = new testNode_1.TestNode(scenario, parent);
        if (node.isSkipped())
            return this.formatter.suite(node, []);
        const lines = [];
        let exampleIndex = 0;
        scenario.examples.forEach((examples) => {
            const titleFormat = this.getExamplesTitleFormat(scenario, examples);
            examples.tableBody.forEach((exampleRow) => {
                const testTitle = this.getOutlineTestTitle(titleFormat, examples, exampleRow, ++exampleIndex);
                const testLines = this.getOutlineTest(scenario, examples, exampleRow, testTitle, node);
                lines.push(...testLines);
            });
        });
        return this.formatter.suite(node, lines);
    }
    /**
     * Generate test from Examples row of Scenario Outline
     */
    // eslint-disable-next-line max-params
    getOutlineTest(scenario, examples, exampleRow, title, parent) {
        const node = new testNode_1.TestNode({ name: title, tags: examples.tags }, parent);
        if (this.skipByTagsExpression(node))
            return [];
        const pickle = this.findPickle(scenario, exampleRow);
        this.testMetaBuilder.registerTest(node, pickle);
        if (node.isSkipped())
            return this.formatter.test(node, new Set(), []);
        const { fixtures, lines } = this.getSteps(scenario, node.tags, exampleRow.id);
        return this.formatter.test(node, fixtures, lines);
    }
    /**
     * Generate test from Scenario
     */
    getTest(scenario, parent) {
        const node = new testNode_1.TestNode(scenario, parent);
        if (this.skipByTagsExpression(node))
            return [];
        const pickle = this.findPickle(scenario);
        this.testMetaBuilder.registerTest(node, pickle);
        if (node.isSkipped())
            return this.formatter.test(node, new Set(), []);
        const { fixtures, lines } = this.getSteps(scenario, node.tags);
        return this.formatter.test(node, fixtures, lines);
    }
    /**
     * Generate test steps
     */
    getSteps(scenario, tags, outlineExampleRowId) {
        const testFixtureNames = new Set();
        const testPoms = new testPoms_1.TestPoms(scenario.name || 'Background');
        const decoratorSteps = [];
        let previousKeywordType = undefined;
        const lines = scenario.steps.map((step, index) => {
            const { keyword, keywordType, fixtureNames: stepFixtureNames, line, pickleStep, stepConfig, } = this.getStep(step, previousKeywordType, outlineExampleRowId);
            previousKeywordType = keywordType;
            testFixtureNames.add(keyword);
            stepFixtureNames.forEach((fixtureName) => testFixtureNames.add(fixtureName));
            if ((0, stepConfig_1.isDecorator)(stepConfig)) {
                testPoms.addByStep(stepConfig.pomNode);
                decoratorSteps.push({ index, keyword, pickleStep, pomNode: stepConfig.pomNode });
            }
            return line;
        });
        // decorator steps handled in second pass to guess fixtures
        if (decoratorSteps.length) {
            testFixtureNames.forEach((fixtureName) => testPoms.addByFixtureName(fixtureName));
            tags?.forEach((tag) => testPoms.addByTag(tag));
            testPoms.resolveFixtures();
            decoratorSteps.forEach((step) => {
                const { line, fixtureName } = this.getDecoratorStep(step, testPoms);
                lines[step.index] = line;
                testFixtureNames.add(fixtureName);
            });
        }
        return { fixtures: testFixtureNames, lines };
    }
    /**
     * Generate step for Given, When, Then
     */
    // eslint-disable-next-line max-statements, complexity
    getStep(step, previousKeywordType, outlineExampleRowId) {
        const pickleStep = this.findPickleStep(step, outlineExampleRowId);
        const stepDefinition = (0, loadSteps_1.findStepDefinition)(this.options.supportCodeLibrary, pickleStep.text, this.featureUri);
        const keywordType = (0, index_1.getStepKeywordType)({
            keyword: step.keyword,
            language: this.language,
            previousKeywordType,
        });
        const enKeyword = this.getStepEnglishKeyword(step);
        if (!stepDefinition) {
            this.undefinedSteps.push({ keywordType, step, pickleStep });
            return this.getMissingStep(enKeyword, keywordType, pickleStep);
        }
        this.usedStepDefinitions.add(stepDefinition);
        // for cucumber-style stepConfig is undefined
        const stepConfig = (0, stepConfig_1.getStepConfig)(stepDefinition);
        if (stepConfig?.hasCustomTest)
            this.hasCustomTest = true;
        if (!(0, stepConfig_1.isPlaywrightStyle)(stepConfig))
            this.hasCucumberStyle = true;
        const fixtureNames = this.getStepFixtureNames(stepDefinition);
        const line = (0, stepConfig_1.isDecorator)(stepConfig)
            ? ''
            : this.formatter.step(enKeyword, pickleStep.text, pickleStep.argument, fixtureNames);
        return {
            keyword: enKeyword,
            keywordType,
            fixtureNames,
            line,
            pickleStep,
            stepConfig,
        };
    }
    getMissingStep(keyword, keywordType, pickleStep) {
        return {
            keyword,
            keywordType,
            fixtureNames: [],
            line: this.formatter.missingStep(keyword, pickleStep.text),
            pickleStep,
            stepConfig: undefined,
        };
    }
    /**
     * Returns pickle for scenario.
     * Pickle is executable entity including background and steps with example values.
     */
    findPickle(scenario, exampleRow) {
        const pickle = this.pickles.find((pickle) => {
            const hasScenarioId = pickle.astNodeIds.includes(scenario.id);
            const hasExampleRowId = !exampleRow || pickle.astNodeIds.includes(exampleRow.id);
            return hasScenarioId && hasExampleRowId;
        });
        if (!pickle) {
            throw new Error(`Pickle not found for scenario: ${scenario.name}`);
        }
        return pickle;
    }
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
    findPickleStep(step, exampleRowId) {
        for (const pickle of this.pickles) {
            const pickleStep = pickle.steps.find(({ astNodeIds }) => {
                const hasStepId = astNodeIds.includes(step.id);
                const hasRowId = !exampleRowId || astNodeIds.includes(exampleRowId);
                return hasStepId && hasRowId;
            });
            if (pickleStep)
                return pickleStep;
        }
        throw new Error(`Pickle step not found for step: ${step.text}`);
    }
    getStepEnglishKeyword(step) {
        const nativeKeyword = step.keyword.trim();
        const enKeyword = nativeKeyword === '*' ? 'And' : this.getEnglishKeyword(nativeKeyword);
        if (!enKeyword)
            throw new Error(`Keyword not found: ${nativeKeyword}`);
        return enKeyword;
    }
    getStepFixtureNames(stepDefinition) {
        const stepConfig = (0, stepConfig_1.getStepConfig)(stepDefinition);
        if ((0, stepConfig_1.isPlaywrightStyle)(stepConfig)) {
            // for decorator steps fixtureNames are defined later in second pass
            return (0, stepConfig_1.isDecorator)(stepConfig) ? [] : (0, fixtures_1.extractFixtureNames)(stepConfig.fn);
        }
        else {
            return (0, fixtures_1.extractFixtureNamesFromFnBodyMemo)(stepDefinition.code);
        }
    }
    getDecoratorStep(step, testPoms) {
        const { keyword, pickleStep, pomNode } = step;
        const resolvedFixtures = testPoms.getResolvedFixtures(pomNode);
        if (resolvedFixtures.length !== 1) {
            const suggestedTags = resolvedFixtures
                .filter((f) => !f.byTag)
                .map((f) => (0, testPoms_1.buildFixtureTag)(f.name))
                .join(', ');
            const suggestedTagsStr = suggestedTags.length
                ? ` or set one of the following tags: ${suggestedTags}`
                : '.';
            (0, exit_1.exit)(`Can't guess fixture for decorator step "${pickleStep.text}" in file: ${this.featureUri}.`, `Please refactor your Page Object classes${suggestedTagsStr}`);
        }
        const fixtureName = resolvedFixtures[0].name;
        return {
            fixtureName,
            line: this.formatter.step(keyword, pickleStep.text, pickleStep.argument, [fixtureName]),
        };
    }
    getOutlineTestTitle(titleFormat, examples, exampleRow, exampleIndex) {
        const params = {
            _index_: exampleIndex,
        };
        exampleRow.cells.forEach((cell, index) => {
            const colName = examples.tableHeader?.cells[index]?.value;
            if (colName)
                params[colName] = cell.value;
        });
        return (0, utils_1.template)(titleFormat, params);
    }
    getExamplesTitleFormat(scenario, examples) {
        return (this.getExamplesTitleFormatFromComment(examples) ||
            this.getExamplesTitleFormatFromScenarioName(scenario, examples) ||
            this.config.examplesTitleFormat);
    }
    getExamplesTitleFormatFromComment(examples) {
        const { line } = examples.location;
        const titleFormatCommentLine = line - 1;
        const comment = this.gherkinDocument.comments.find((c) => {
            return c.location.line === titleFormatCommentLine;
        });
        const commentText = comment?.text?.trim();
        const prefix = '# title-format:';
        return commentText?.startsWith(prefix) ? commentText.replace(prefix, '').trim() : '';
    }
    getExamplesTitleFormatFromScenarioName(scenario, examples) {
        const columnsInScenarioName = (0, utils_1.extractTemplateParams)(scenario.name);
        const hasColumnsFromExamples = columnsInScenarioName.length &&
            examples.tableHeader?.cells?.some((cell) => {
                return cell.value && columnsInScenarioName.includes(cell.value);
            });
        return hasColumnsFromExamples ? scenario.name : '';
    }
    skipByTagsExpression(node) {
        // see: https://github.com/cucumber/tag-expressions/tree/main/javascript
        const { tagsExpression } = this.options;
        return tagsExpression && !tagsExpression.evaluate(node.tags);
    }
    isOutline(scenario) {
        const keyword = this.getEnglishKeyword(scenario.keyword);
        return (keyword === 'ScenarioOutline' ||
            keyword === 'Scenario Outline' ||
            keyword === 'Scenario Template');
    }
    getEnglishKeyword(keyword) {
        return this.i18nKeywordsMap ? this.i18nKeywordsMap.get(keyword) : keyword;
    }
}
exports.TestFile = TestFile;
//# sourceMappingURL=testFile.js.map
"use strict";
/**
 * Helper to format Playwright test file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatter = void 0;
const jsStringWrap_1 = require("../utils/jsStringWrap");
const utils_1 = require("../utils");
const utils_2 = require("../playwright/utils");
const supportsTags = utils_2.playwrightVersion >= '1.42.0';
class Formatter {
    constructor(config) {
        this.config = config;
    }
    fileHeader(featureUri, importTestFrom) {
        // always use "/" for imports, see #91
        const importTestFromFile = (0, utils_1.toPosixPath)(importTestFrom?.file || 'playwright-bdd');
        let varName = importTestFrom?.varName || 'test';
        if (varName !== 'test')
            varName = `${varName} as test`;
        return [
            `/** Generated from: ${featureUri} */`, // prettier-ignore
            // this.quoted() is not possible for 'import from' as backticks not parsed
            `import { ${varName} } from ${JSON.stringify(importTestFromFile)};`,
            '',
        ];
    }
    suite(node, children) {
        const firstLine = `test.describe${this.getSubFn(node)}(${this.quoted(node.title)}, () => {`;
        if (!children.length)
            return [`${firstLine}});`, ''];
        return [firstLine, '', ...children.map(indent), `});`, ''];
    }
    beforeEach(fixtures, children) {
        const fixturesStr = [...fixtures].join(', ');
        const featureFixtures = [...fixtures].filter(n => n.startsWith('feature'));
        if (!featureFixtures.length) {
            // prettier-ignore
            return [
                `test.beforeEach(async ({ ${fixturesStr} }) => {`,
                ...children.map(indent),
                `});`,
                '',
            ];
        }
        else {
            const featureFixturesStr = featureFixtures.join(', ');
            // prettier-ignore
            return [
                `test.afterAll(async ({ $uri, $testInfo, ${featureFixturesStr} })) => { return Promise.all([${featureFixturesStr}].map(async f => f.afterAll?.($uri, $testInfo))); });`,
                `test.beforeEach(async ({ ${fixturesStr} }) => {`,
                ...children.map(indent),
                `});`,
                '',
            ];
        }
    }
    test(node, fixtures, children) {
        const fixturesStr = [...fixtures].join(', ');
        const title = this.quoted(node.title);
        const tags = supportsTags && node.tags.length
            ? `{ tag: [${node.tags.map((tag) => this.quoted(tag)).join(', ')}] }, `
            : '';
        const firstLine = `test${this.getSubFn(node)}(${title}, ${tags}async ({ ${fixturesStr} }) => {`;
        if (!children.length)
            return [`${firstLine}});`, ''];
        return [firstLine, ...children.map(indent), `});`, ''];
    }
    // eslint-disable-next-line max-params
    step(keyword, text, argument, fixtureNames = []) {
        const fixtures = fixtureNames.length ? `{ ${fixtureNames.join(', ')} }` : '';
        const argumentArg = argument ? JSON.stringify(argument) : fixtures ? 'null' : '';
        const textArg = this.quoted(text);
        const args = [textArg, argumentArg, fixtures].filter((arg) => arg !== '').join(', ');
        return `await ${keyword}(${args});`;
    }
    missingStep(keyword, text) {
        return `// missing step: ${keyword}(${this.quoted(text)});`;
    }
    technicalSection(testMetaBuilder, featureUri, fixtures) {
        return [
            '// == technical section ==', // prettier-ignore
            '',
            'test.use({',
            ...[
                '$test: ({}, use) => use(test),',
                '$testMetaMap: ({}, use) => use(testMetaMap),',
                `$uri: ({}, use) => use(${this.quoted(featureUri)}),`,
                ...fixtures,
            ].map(indent),
            '});',
            '',
            'const testMetaMap = {',
            ...testMetaBuilder.getObjectLines().map(indent),
            '};',
        ];
    }
    bddWorldFixtures() {
        const fixturesObj = {
            page: null,
            context: null,
            browser: null,
            browserName: null,
            request: null,
        };
        const fixtures = Object.keys(fixturesObj).join(', ');
        return [`$bddWorldFixtures: ({ ${fixtures} }, use) => use({ ${fixtures} }),`];
    }
    scenarioHookFixtures(fixtureNames) {
        if (!fixtureNames.length)
            return [];
        const fixtures = fixtureNames.join(', ');
        return [`$scenarioHookFixtures: ({ ${fixtures} }, use) => use({ ${fixtures} }),`];
    }
    workerHookFixtures(fixtureNames) {
        if (!fixtureNames.length)
            return [];
        const fixtures = fixtureNames.join(', ');
        const scope = this.quoted('worker');
        return [
            `$workerHookFixtures: [({ ${fixtures} }, use) => use({ ${fixtures} }), { scope: ${scope} }],`,
        ];
    }
    langFixture(lang) {
        return [`$lang: ({}, use) => use(${this.quoted(lang)}),`];
    }
    getSubFn(node) {
        if (node.flags.only)
            return '.only';
        if (node.flags.skip)
            return '.skip';
        if (node.flags.fixme)
            return '.fixme';
        return '';
    }
    /**
     * Apply this function only to string literals (mostly titles here).
     * Objects and arrays are handled with JSON.strinigfy,
     * b/c object keys can't be in backticks.
     * See: https://stackoverflow.com/questions/33194138/template-string-as-object-property-name
     */
    quoted(str) {
        return (0, jsStringWrap_1.jsStringWrap)(str, { quotes: this.config.quotes });
    }
}
exports.Formatter = Formatter;
function indent(value) {
    return value ? `${'  '}${value}` : value;
}
//# sourceMappingURL=formatter.js.map
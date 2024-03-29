"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorldConstructor = exports.BddWorld = void 0;
const cucumber_1 = require("@cucumber/cucumber");
const bddWorldInternal_1 = require("./bddWorldInternal");
class BddWorld extends cucumber_1.World {
    constructor(options) {
        super(options);
        this.options = options;
        this.$internal = new bddWorldInternal_1.BddWorldInternal(this);
    }
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
    useFixture(fixtureName) {
        return this.$internal.currentStepFixtures[fixtureName];
    }
    get page() {
        return this.options.$bddWorldFixtures.page;
    }
    get context() {
        return this.options.$bddWorldFixtures.context;
    }
    get browser() {
        return this.options.$bddWorldFixtures.browser;
    }
    get browserName() {
        return this.options.$bddWorldFixtures.browserName;
    }
    get request() {
        return this.options.$bddWorldFixtures.request;
    }
    get testInfo() {
        return this.options.testInfo;
    }
    get tags() {
        return this.options.$tags;
    }
    get test() {
        return this.options.$test;
    }
    async init() {
        // async setup before each test
    }
    async destroy() {
        // async teardown after each test
    }
}
exports.BddWorld = BddWorld;
function getWorldConstructor(supportCodeLibrary) {
    // setWorldConstructor was not called
    if (supportCodeLibrary.World === cucumber_1.World) {
        return BddWorld;
    }
    if (!Object.prototype.isPrototypeOf.call(BddWorld, supportCodeLibrary.World)) {
        throw new Error(`CustomWorld should inherit from playwright-bdd World`);
    }
    return supportCodeLibrary.World;
}
exports.getWorldConstructor = getWorldConstructor;
//# sourceMappingURL=bddWorld.js.map
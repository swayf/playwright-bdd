"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFixtureTag = exports.TestPoms = void 0;
/**
 * Track PomNodes used in the particular test.
 * To select correct fixture for decorator steps.
 *
 * Idea: try to use the deepest child fixture for parent steps.
 *
 * Example inheritance tree:
 *      A
 *     / \
 *    B   C
 *   / \   \
 *  D   E   F
 *
 * If test uses steps from classes A and D:
 * -> resolved fixture will be D, even for steps from A.
 *
 * If test uses steps from classes A, D and C:
 * -> error, b/c A has 2 possible fixtures.
 *
 * If test uses steps from classes A and C, but @fixture tag is D:
 * -> error, b/c A has 2 possible fixtures.
 */
const class_1 = require("../steps/decorators/class");
const exit_1 = require("../utils/exit");
const FIXTURE_TAG_PREFIX = '@fixture:';
class TestPoms {
    constructor(title) {
        this.title = title;
        // map of poms used in test
        this.usedPoms = new Map();
    }
    addByStep(pomNode) {
        this.addUsedPom(pomNode, { byTag: false });
    }
    addByFixtureName(fixtureName) {
        const pomNode = (0, class_1.getPomNodeByFixtureName)(fixtureName);
        this.addUsedPom(pomNode, { byTag: false });
    }
    addByTag(tag) {
        const fixtureName = extractFixtureName(tag);
        if (fixtureName) {
            const pomNode = (0, class_1.getPomNodeByFixtureName)(fixtureName);
            this.addUsedPom(pomNode, { byTag: true });
        }
    }
    /**
     * Resolve all used pomNodes to fixtures.
     * This is needed to handle @fixture: tagged pomNodes
     * that does not have steps in the test, but should be considered.
     */
    resolveFixtures() {
        this.usedPoms.forEach((_, pomNode) => {
            this.getResolvedFixtures(pomNode);
        });
    }
    /**
     * Returns fixtures suitable for particular pomNode (actually for step)
     */
    getResolvedFixtures(pomNode) {
        const usedPom = this.usedPoms.get(pomNode);
        if (usedPom?.fixtures)
            return usedPom.fixtures;
        // Recursively resolve children fixtures, used in test.
        let childFixtures = [...pomNode.children]
            .map((child) => this.getResolvedFixtures(child))
            .flat();
        if (!usedPom)
            return childFixtures;
        if (childFixtures.length) {
            this.verifyChildFixtures(pomNode, usedPom, childFixtures);
            usedPom.fixtures = childFixtures;
        }
        else {
            usedPom.fixtures = [{ name: pomNode.fixtureName, byTag: usedPom.byTag }];
        }
        return usedPom.fixtures;
    }
    addUsedPom(pomNode, { byTag }) {
        if (!pomNode)
            return;
        const usedPom = this.usedPoms.get(pomNode);
        if (usedPom) {
            if (byTag && !usedPom.byTag)
                usedPom.byTag = true;
        }
        else {
            this.usedPoms.set(pomNode, { byTag });
        }
    }
    /**
     * For scenarios with @fixture:xxx tags verify that there are no steps from fixtures,
     * deeper than xxx.
     * @fixture:xxx tag provides maximum fixture that can be used in the scenario.
     */
    verifyChildFixtures(pomNode, usedPom, childFixtures) {
        if (!usedPom.byTag)
            return;
        const childFixturesBySteps = childFixtures.filter((f) => !f.byTag);
        if (childFixturesBySteps.length) {
            (0, exit_1.exit)(`Scenario "${this.title}" contains ${childFixturesBySteps.length} step(s)`, `not compatible with required fixture "${pomNode.fixtureName}"`);
        }
    }
}
exports.TestPoms = TestPoms;
function extractFixtureName(tag) {
    return tag.startsWith(FIXTURE_TAG_PREFIX) ? tag.replace(FIXTURE_TAG_PREFIX, '') : '';
}
function buildFixtureTag(fixtureName) {
    return `${FIXTURE_TAG_PREFIX}${fixtureName}`;
}
exports.buildFixtureTag = buildFixtureTag;
//# sourceMappingURL=testPoms.js.map
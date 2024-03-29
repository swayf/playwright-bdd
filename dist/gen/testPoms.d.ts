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
import { PomNode } from '../steps/decorators/class';
type UsedFixture = {
    name: string;
    byTag: boolean;
};
export declare class TestPoms {
    private title;
    private usedPoms;
    constructor(title: string);
    addByStep(pomNode?: PomNode): void;
    addByFixtureName(fixtureName: string): void;
    addByTag(tag: string): void;
    /**
     * Resolve all used pomNodes to fixtures.
     * This is needed to handle @fixture: tagged pomNodes
     * that does not have steps in the test, but should be considered.
     */
    resolveFixtures(): void;
    /**
     * Returns fixtures suitable for particular pomNode (actually for step)
     */
    getResolvedFixtures(pomNode: PomNode): UsedFixture[];
    private addUsedPom;
    /**
     * For scenarios with @fixture:xxx tags verify that there are no steps from fixtures,
     * deeper than xxx.
     * @fixture:xxx tag provides maximum fixture that can be used in the scenario.
     */
    private verifyChildFixtures;
}
export declare function buildFixtureTag(fixtureName: string): string;
export {};
//# sourceMappingURL=testPoms.d.ts.map
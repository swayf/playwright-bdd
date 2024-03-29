/**
 * Universal TestNode class representing test or suite in a test file.
 * Holds parent-child links.
 * Allows to inherit tags and titles path.
 */
import { Tag } from '@cucumber/messages';
interface GherkinNode {
    name: string;
    tags: readonly Tag[];
}
type TestNodeFlags = {
    only?: boolean;
    skip?: boolean;
    fixme?: boolean;
};
export declare class TestNode {
    title: string;
    titlePath: string[];
    ownTags: string[];
    tags: string[];
    flags: TestNodeFlags;
    constructor(gherkinNode: GherkinNode, parent?: TestNode);
    isSkipped(): boolean | undefined;
    private initFlags;
    private setFlag;
}
export {};
//# sourceMappingURL=testNode.d.ts.map
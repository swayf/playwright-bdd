"use strict";
/**
 * Universal TestNode class representing test or suite in a test file.
 * Holds parent-child links.
 * Allows to inherit tags and titles path.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestNode = void 0;
const utils_1 = require("../utils");
const SPECIAL_TAGS = ['@only', '@skip', '@fixme'];
class TestNode {
    constructor(gherkinNode, parent) {
        this.flags = {};
        this.title = gherkinNode.name;
        this.titlePath = (parent?.titlePath || []).concat([this.title]);
        this.ownTags = (0, utils_1.removeDuplicates)(getTagNames(gherkinNode.tags));
        this.tags = (0, utils_1.removeDuplicates)((parent?.tags || []).concat(this.ownTags));
        this.initFlags();
    }
    isSkipped() {
        return this.flags.skip || this.flags.fixme;
    }
    initFlags() {
        this.ownTags.forEach((tag) => {
            if (isSpecialTag(tag))
                this.setFlag(tag);
        });
    }
    // eslint-disable-next-line complexity
    setFlag(tag) {
        // in case of several special tags, @only takes precendence
        if (tag === '@only')
            this.flags = { only: true };
        if (tag === '@skip' && !this.flags.only)
            this.flags.skip = true;
        if (tag === '@fixme' && !this.flags.only)
            this.flags.fixme = true;
    }
}
exports.TestNode = TestNode;
function getTagNames(tags) {
    return tags.map((tag) => tag.name);
}
function isSpecialTag(tag) {
    return SPECIAL_TAGS.includes(tag);
}
//# sourceMappingURL=testNode.js.map
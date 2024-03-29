"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BddWorldInternal = void 0;
const bddDataAttachment_1 = require("./bddDataAttachment");
class BddWorldInternal {
    constructor(world) {
        this.currentStepFixtures = {};
        this.bddData = new bddDataAttachment_1.BddData(world);
    }
}
exports.BddWorldInternal = BddWorldInternal;
//# sourceMappingURL=bddWorldInternal.js.map
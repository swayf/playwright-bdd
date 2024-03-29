"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBddDataAttachment = exports.getBddDataFromTestResult = exports.BddData = void 0;
const createTestStep_1 = require("../cucumber/createTestStep");
const utils_1 = require("../utils");
const BDD_DATA_ATTACHMENT_NAME = '__bddData';
class BddData {
    constructor(world) {
        this.world = world;
        this.steps = [];
    }
    registerStep(stepDefinition, stepText, pwStepLocation) {
        const step = (0, createTestStep_1.createTestStep)(stepDefinition, stepText);
        this.steps.push({
            pwStepLocation: (0, utils_1.stringifyLocation)(pwStepLocation),
            stepMatchArgumentsLists: step.stepMatchArgumentsLists || [],
        });
    }
    async attach(testMeta, uri) {
        const attachment = {
            uri,
            pickleLocation: testMeta.pickleLocation,
            steps: this.steps,
        };
        await this.world.testInfo.attach(BDD_DATA_ATTACHMENT_NAME, {
            contentType: 'application/json',
            body: JSON.stringify(attachment),
        });
    }
}
exports.BddData = BddData;
function getBddDataFromTestResult(result) {
    const attachment = result.attachments.find(isBddDataAttachment);
    const attachmentBody = attachment?.body?.toString();
    return attachmentBody ? JSON.parse(attachmentBody) : undefined;
}
exports.getBddDataFromTestResult = getBddDataFromTestResult;
function isBddDataAttachment(attachment) {
    return attachment.name === BDD_DATA_ATTACHMENT_NAME;
}
exports.isBddDataAttachment = isBddDataAttachment;
//# sourceMappingURL=bddDataAttachment.js.map
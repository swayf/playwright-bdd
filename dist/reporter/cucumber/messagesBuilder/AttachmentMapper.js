"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentMapper = void 0;
const AutofillMap_1 = require("../../../utils/AutofillMap");
const pwStepUtils_1 = require("./pwStepUtils");
const bddDataAttachment_1 = require("../../../run/bddDataAttachment");
class AttachmentMapper {
    constructor(result) {
        this.result = result;
        this.stepAttachments = new AutofillMap_1.AutofillMap();
        this.unusedAttachments = [];
        this.mapAttachments();
    }
    getStepAttachments(pwStep) {
        return this.stepAttachments.get(pwStep) || [];
    }
    mapAttachments() {
        const allAttachments = this.result.attachments.slice();
        const attachmentSteps = (0, pwStepUtils_1.collectStepsWithCategory)(this.result, 'attach');
        attachmentSteps.forEach((attachmentStep) => {
            this.mapAttachment(attachmentStep, allAttachments);
        });
        this.unusedAttachments.push(...allAttachments);
        this.mapUnusedAttachments();
        this.mapStdoutAttachments('stdout');
        this.mapStdoutAttachments('stderr');
    }
    mapAttachment(attachmentStep, allAttachments) {
        const index = allAttachments.findIndex((a) => getAttachmentStepTitle(a.name) === attachmentStep.title);
        if (index === -1) {
            throw new Error(`Attachment not found for step: ${attachmentStep.title}`);
        }
        const [foundAttachment] = allAttachments.splice(index, 1);
        if ((0, bddDataAttachment_1.isBddDataAttachment)(foundAttachment))
            return;
        const parentStep = attachmentStep.parent;
        // step.parent is empty:
        // - in PW = 1.34 for screenshot attachment
        // - in PW <= 1.40 when testInfo.attach() promise
        // is awaited in the next async tick: 'attach' steps are on the top level
        const stepAttachments = parentStep
            ? this.stepAttachments.getOrCreate(parentStep, () => [])
            : this.unusedAttachments;
        stepAttachments.push(foundAttachment);
    }
    mapUnusedAttachments() {
        if (!this.unusedAttachments.length)
            return;
        // map unused attachments to the 'After Hooks' step
        const afterHooksRoot = this.getAfterHooksRoot();
        const stepAttachments = this.stepAttachments.getOrCreate(afterHooksRoot, () => []);
        stepAttachments.push(...this.unusedAttachments);
    }
    mapStdoutAttachments(name) {
        // map stdout / stderr to the 'After Hooks' step
        if (!this.result[name]?.length)
            return;
        const body = this.result[name].join('');
        const afterHooksRoot = this.getAfterHooksRoot();
        const stepAttachments = this.stepAttachments.getOrCreate(afterHooksRoot, () => []);
        stepAttachments.push({
            name,
            contentType: 'text/plain',
            body: Buffer.from(body),
        });
    }
    getAfterHooksRoot() {
        const afterHooksRoot = (0, pwStepUtils_1.getHooksRootPwStep)(this.result, 'after');
        if (!afterHooksRoot) {
            throw new Error(`Can not find after hooks root.`);
        }
        return afterHooksRoot;
    }
}
exports.AttachmentMapper = AttachmentMapper;
// See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L413
function getAttachmentStepTitle(attachmentName) {
    return `attach "${attachmentName}"`;
}
//# sourceMappingURL=AttachmentMapper.js.map
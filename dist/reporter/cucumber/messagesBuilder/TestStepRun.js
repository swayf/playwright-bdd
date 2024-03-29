"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestStepRun = void 0;
const messages = __importStar(require("@cucumber/messages"));
const stripAnsiEscapes_1 = require("../../../utils/stripAnsiEscapes");
const timing_1 = require("./timing");
const TestStepAttachments_1 = require("./TestStepAttachments");
class TestStepRun {
    constructor(testCaseRun, testStep, pwStep) {
        this.testCaseRun = testCaseRun;
        this.testStep = testStep;
        this.pwStep = pwStep;
    }
    buildMessages() {
        const stepAttachments = new TestStepAttachments_1.TestStepAttachments(this.testCaseRun, this.testStep, this.pwStep);
        return [
            this.buildTestStepStarted(), // prettier-ignore
            ...stepAttachments.buildMessages(),
            this.buildTestStepFinished(),
        ];
    }
    wasExecuted() {
        return Boolean(this.pwStep);
    }
    get startTime() {
        return this.wasExecuted() ? this.pwStep.startTime : this.testCaseRun.result.startTime;
    }
    get duration() {
        return this.wasExecuted() ? this.pwStep.duration : 0;
    }
    buildTestStepStarted() {
        const testStepStarted = {
            testCaseStartedId: this.testCaseRun.id,
            testStepId: this.testStep.id,
            timestamp: (0, timing_1.toCucumberTimestamp)(this.startTime.getTime()),
        };
        return { testStepStarted };
    }
    buildTestStepFinished() {
        const error = this.getStepError();
        const testStepFinished = {
            testCaseStartedId: this.testCaseRun.id,
            testStepId: this.testStep.id,
            testStepResult: {
                duration: messages.TimeConversion.millisecondsToDuration(this.duration),
                status: this.getStatus(error),
                message: error ? formatError(error) : undefined,
                exception: error ? this.buildException(error) : undefined,
            },
            timestamp: (0, timing_1.toCucumberTimestamp)(this.startTime.getTime() + this.duration),
        };
        return { testStepFinished };
    }
    buildException(error) {
        return {
            type: 'Error',
            message: error.message ? (0, stripAnsiEscapes_1.stripAnsiEscapes)(error.message) : undefined,
            stackTrace: error.stack ? (0, stripAnsiEscapes_1.stripAnsiEscapes)(error.stack) : undefined,
            // Use type casting b/c older versions of @cucumber/messages don't have 'stackTrace' field
            // todo: add direct dependency on @cucumber/messages
        };
    }
    getStatus(error) {
        switch (true) {
            case Boolean(error):
                return messages.TestStepResultStatus.FAILED;
            case !this.wasExecuted():
                return messages.TestStepResultStatus.SKIPPED;
            default:
                return messages.TestStepResultStatus.PASSED;
        }
    }
    // eslint-disable-next-line complexity
    getStepError() {
        if (!this.pwStep)
            return;
        if (this.testCaseRun.errorSteps.has(this.pwStep)) {
            return this.pwStep.error;
        }
        if (this.testCaseRun.isTimeouted() && this.pwStep === this.testCaseRun.timeoutedStep) {
            return {
                message: this.testCaseRun.result.errors?.map((e) => e.message).join('\n\n'),
            };
        }
    }
}
exports.TestStepRun = TestStepRun;
function formatError(error) {
    return (0, stripAnsiEscapes_1.stripAnsiEscapes)([error.message, error.snippet].filter(Boolean).join('\n'));
}
//# sourceMappingURL=TestStepRun.js.map
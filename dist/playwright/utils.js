"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaywrightModulePath = exports.requirePlaywrightModule = exports.playwrightVersion = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const utils_1 = require("../utils");
// cache playwright root
let playwrightRoot = '';
exports.playwrightVersion = (0, utils_1.getPackageVersion)('@playwright/test');
/**
 * Requires Playwright's internal module that is not exported via package.exports.
 */
function requirePlaywrightModule(modulePath) {
    const absPath = node_path_1.default.isAbsolute(modulePath) ? modulePath : getPlaywrightModulePath(modulePath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(absPath);
}
exports.requirePlaywrightModule = requirePlaywrightModule;
function getPlaywrightModulePath(relativePath) {
    return node_path_1.default.join(getPlaywrightRoot(), relativePath);
}
exports.getPlaywrightModulePath = getPlaywrightModulePath;
function getPlaywrightRoot() {
    if (!playwrightRoot) {
        // Since 1.38 all modules moved from @playwright/test to playwright.
        // Here we check existance of 'lib' dir instead of checking version.
        // See: https://github.com/microsoft/playwright/pull/26946
        const playwrightTestRoot = (0, utils_1.resolvePackageRoot)('@playwright/test');
        const libDir = node_path_1.default.join(playwrightTestRoot, 'lib');
        playwrightRoot = node_fs_1.default.existsSync(libDir) ? playwrightTestRoot : (0, utils_1.resolvePackageRoot)('playwright');
    }
    return playwrightRoot;
}
//# sourceMappingURL=utils.js.map
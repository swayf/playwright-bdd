#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const test_1 = require("./commands/test");
const env_1 = require("./commands/env");
const export_1 = require("./commands/export");
const utils_1 = require("../utils");
const program = new commander_1.Command();
program
    .name('bddgen')
    .description(`Playwright-bdd CLI v${(0, utils_1.getPackageVersion)('playwright-bdd')}`)
    .addCommand(test_1.testCommand, { isDefault: true })
    .addCommand(export_1.exportCommand)
    .addCommand(env_1.envCommand)
    .addHelpCommand(false)
    .parse();
//# sourceMappingURL=index.js.map
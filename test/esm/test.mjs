import { test, getTestName, execPlaywrightTest } from '../helpers.mjs';

// Skip on CI for Win as it fails with error:
// TypeError: Invalid module "..\\..\\steps\\fixtures.js" is not a valid package name
// todo: investigate
// temprorary skipped this test locally as it hangs on osx as well. Investigate.
const skip = !process.env.CI || (process.env.CI && process.platform === 'win32');

test(getTestName(import.meta), { skip }, (t) => execPlaywrightTest(t.name));

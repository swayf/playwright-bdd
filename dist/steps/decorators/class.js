"use strict";
/**
 * Class level @Fixture decorator.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPomNodeByFixtureName = exports.Fixture = void 0;
const steps_1 = require("./steps");
const exit_1 = require("../../utils/exit");
/**
 * Graph of POM class inheritance.
 * Allows to guess correct fixture by step text.
 */
const pomGraph = new Map();
/**
 * @Fixture decorator.
 */
function Fixture(fixtureName) {
    // context parameter is required for decorator by TS even though it's not used
    return (Ctor, _context) => {
        createPomNode(Ctor, fixtureName);
    };
}
exports.Fixture = Fixture;
function createPomNode(Ctor, fixtureName) {
    const pomNode = {
        fixtureName,
        className: Ctor.name,
        children: new Set(),
    };
    ensureUniqueFixtureName(pomNode);
    pomGraph.set(Ctor, pomNode);
    (0, steps_1.linkStepsWithPomNode)(Ctor, pomNode);
    linkParentWithPomNode(Ctor, pomNode);
    return pomNode;
}
function ensureUniqueFixtureName({ fixtureName, className }) {
    if (!fixtureName)
        return;
    const existingPom = getPomNodeByFixtureName(fixtureName);
    if (existingPom)
        (0, exit_1.exit)(`Duplicate fixture name "${fixtureName}"`, `defined for classes: ${existingPom.className}, ${className}`);
}
function linkParentWithPomNode(Ctor, pomNode) {
    const parentCtor = Object.getPrototypeOf(Ctor);
    if (!parentCtor)
        return;
    // if parentCtor is not in pomGraph, add it.
    // Case: parent class is not marked with @Fixture, but has decorator steps (base class)
    const parentPomNode = pomGraph.get(parentCtor) || createPomNode(parentCtor, '');
    parentPomNode.children.add(pomNode);
}
function getPomNodeByFixtureName(fixtureName) {
    for (const pomNode of pomGraph.values()) {
        if (pomNode.fixtureName === fixtureName)
            return pomNode;
    }
}
exports.getPomNodeByFixtureName = getPomNodeByFixtureName;
//# sourceMappingURL=class.js.map
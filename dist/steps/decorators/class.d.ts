/**
 * Class level @Fixture decorator.
 */
import { CustomFixtures, KeyValue } from '../../playwright/types';
export type PomNode = {
    fixtureName: string;
    className: string;
    children: Set<PomNode>;
};
/**
 * @Fixture decorator.
 */
export declare function Fixture<T extends KeyValue>(fixtureName: keyof CustomFixtures<T>): (Ctor: Function, _context: ClassDecoratorContext) => void;
export declare function getPomNodeByFixtureName(fixtureName: string): PomNode | undefined;
//# sourceMappingURL=class.d.ts.map
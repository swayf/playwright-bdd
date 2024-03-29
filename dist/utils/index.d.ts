/**
 * Returns Symbol by name.
 * See: https://stackoverflow.com/questions/50453640/how-can-i-get-the-value-of-a-symbol-property
 */
export declare function getSymbolByName<T extends object>(target: T, name?: string): keyof T;
/**
 * Inserts params into template.
 * Params defined as <param>.
 */
export declare function template(t: string, params?: Record<string, unknown>): string;
/**
 * Extracts all template params from string.
 * Params defined as <param>.
 */
export declare function extractTemplateParams(t: string): string[];
export declare function removeDuplicates<T>(arr: T[]): T[];
export declare function resolvePackageRoot(packageName: string): string;
export declare function getPackageVersion(packageName: string): string;
export declare function callWithTimeout<T>(fn: () => T, timeout?: number, timeoutMsg?: string): Promise<T>;
export declare function stringifyLocation({ line, column }: {
    line: number;
    column?: number;
}): string;
export declare function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K>;
/**
 * Returns path with "/" separator on all platforms.
 * See: https://stackoverflow.com/questions/53799385/how-can-i-convert-a-windows-path-to-posix-path-using-node-path
 */
export declare function toPosixPath(somePath: string): string;
//# sourceMappingURL=index.d.ts.map
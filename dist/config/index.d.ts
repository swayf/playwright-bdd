import { ImportTestFrom } from '../gen/formatter';
import { IConfiguration } from '@cucumber/cucumber/api';
type CucumberConfig = Partial<IConfiguration>;
type OwnConfig = {
    /** Dir to save generated files */
    outputDir?: string;
    /** Path to file for importing test instance */
    importTestFrom?: string | ImportTestFrom;
    /** Verbose mode */
    verbose?: boolean;
    /** Skip generation of test files */
    skip?: boolean;
    /** Test title format for scenario outline examples */
    examplesTitleFormat?: string;
    /** Quotes style in generated tests */
    quotes?: 'single' | 'double' | 'backtick';
    /** Tags expression to filter scenarios for generation */
    tags?: string;
    /** Parent directory for all feature files used to construct output paths */
    featuresRoot?: string;
    /** Add special BDD attachments for Cucumber reports */
    enrichReporterData?: boolean;
};
export declare const defaults: Required<Pick<BDDInputConfig, 'outputDir' | 'publishQuiet' | 'verbose' | 'examplesTitleFormat' | 'quotes'>>;
export type BDDInputConfig = OwnConfig & CucumberConfig;
export type BDDConfig = BDDInputConfig & typeof defaults & {
    featuresRoot: string;
    importTestFrom?: ImportTestFrom;
};
export declare function defineBddConfig(inputConfig?: BDDInputConfig): string;
export declare function extractCucumberConfig(config: BDDConfig): CucumberConfig;
export {};
//# sourceMappingURL=index.d.ts.map
// A workaround to use private attributes of obsidian-api.
import 'obsidian';

declare module 'obsidian' {
  // TODO(tkat0): feature request for obsidian: allow developers to use config
  //  config is in `.obsidian/app.json`
  //  https://github.com/obsidianmd/obsidian-api/issues/34
  // NOTE(tkat0): a attribute is undefined if it uses default value.
  export interface VaultConfig {
    alwaysUpdateLinks?: boolean;
    baseFontSize?: number;
    fileSortOrder?: string;
    legacyEditor?: boolean;
    livePreview?: boolean;
    promptDelete?: boolean;
    showFrontmatter?: boolean;
    showLineNumber?: boolean;
    spellcheck?: boolean;
    strictLineBreaks?: boolean;
    theme?: string;
    useTab?: boolean;
    tabSize?: number;
  }

  interface Vault {
    config: VaultConfig;
  }
}

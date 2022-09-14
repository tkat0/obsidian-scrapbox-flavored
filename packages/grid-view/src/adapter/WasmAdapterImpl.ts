import type { WasmAdapter } from 'src/domain/adapter/WasmAdapter';

import init, { MarkdownConverter } from '@obsidian-scrapbox-flavored/grid-view-core';
import type { Config } from '@obsidian-scrapbox-flavored/grid-view-core';
import wasm from '@obsidian-scrapbox-flavored/grid-view-core/pkg/grid_view_core_bg.wasm';

import type { Description } from '../domain/model';

export class WasmAdapterImpl implements WasmAdapter {
  private constructor() {}

  static async init(): Promise<WasmAdapterImpl> {
    await init(wasm);
    return new WasmAdapterImpl();
  }

  getSummarizedDescription(content: string): Description[][] {
    const config: Config = {
      heading1Mapping: 3,
      boldToHeading: false,
      indent: {
        type: 'Space',
        size: 4,
      },
    };

    // get 5 lines except new line
    let description: Description[][] = [];
    try {
      const converter = new MarkdownConverter(content + '\n', config);
      description = converter.description(5);
      converter.free();
    } catch (error) {
      // console.error(title, error);
    }
    return description;
  }
}

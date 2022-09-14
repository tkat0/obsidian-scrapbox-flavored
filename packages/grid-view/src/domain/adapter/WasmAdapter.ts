import type { Description } from '../model';

export interface WasmAdapter {
  getSummarizedDescription(content: string): Description[][];
}

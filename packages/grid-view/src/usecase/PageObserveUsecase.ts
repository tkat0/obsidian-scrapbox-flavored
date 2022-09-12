import type { ObsidianAdapter } from '../adapter/ObsidianAdapter';

export interface PageObserveUsecase {
  invoke: (input: PageObserveUsecaseInput) => void;
}

interface PageObserveUsecaseInput {
  onChange: () => void;
}

export class PageObserveUsecaseImpl implements PageObserveUsecase {
  constructor(private obsidianAdapter: ObsidianAdapter) {}

  invoke(input: PageObserveUsecaseInput) {
    this.obsidianAdapter.onFileChange(input.onChange);
  }
}

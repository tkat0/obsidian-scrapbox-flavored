import type { GetRelatedPagesUsecase } from 'src/domain/usecase/GetRelatedPagesUsecase';
import { mock } from 'vitest-mock-extended';

import type { File, ObsidianAdapter } from '../domain/adapter/ObsidianAdapter';
import type { WasmAdapter } from '../domain/adapter/WasmAdapter';
import { GetRelatedPagesUsecaseImpl } from './GetRelatedPagesUsecase';

describe('GetRelatedPagesUsecaseImpl', () => {
  const obsidianAdapter = mock<ObsidianAdapter>();
  const wasmAdapter = mock<WasmAdapter>();
  let getRelatedPageUsecase: GetRelatedPagesUsecase;

  beforeEach(async () => {
    wasmAdapter.getSummarizedDescription.mockReturnValue([[]]);
    obsidianAdapter.getActiveFile.mockReturnValue(dummyFile);
    obsidianAdapter.getMetadata.mockReturnValue({
      resolvedLinks: [dummyFile, dummyFile], // two same links in the page
      unresolvedLinks: ['unresolved', 'link-to-heading#^abc'],
      tags: ['test'],
    });
    obsidianAdapter.cachedRead.mockResolvedValue('');
    obsidianAdapter.getMarkdownFiles.mockReturnValue([dummyFile]);

    getRelatedPageUsecase = await GetRelatedPagesUsecaseImpl.init(obsidianAdapter, wasmAdapter);
  });

  it('should find related cards', async () => {
    const ret = await getRelatedPageUsecase.invoke({
      pinStarred: true,
      sort: 'file-name-a-to-z',
    });

    expect(ret.resolvedLinkCards.length).toBe(1);
    expect(ret.unresolvedLinkCards.length).toBe(1);
    expect(Object.keys(ret.tagCards).length).toBe(1);
  });

  it('should not find related cards', async () => {
    obsidianAdapter.getMetadata.mockReturnValue({
      resolvedLinks: [],
      unresolvedLinks: [],
      tags: [],
    });

    const ret = await getRelatedPageUsecase.invoke({
      pinStarred: true,
      sort: 'file-name-a-to-z',
    });

    expect(ret.resolvedLinkCards.length).toBe(0);
    expect(ret.unresolvedLinkCards.length).toBe(0);
    expect(Object.keys(ret.tagCards).length).toBe(0);
  });
});

const dummyFile: File = {
  basename: 'a',
  extension: 'md',
  name: 'a.md',
  path: 'test/a.md',
  stat: {
    ctime: 0,
    mtime: 0,
    size: 100,
  },
};

import type { GetPagesUsecase } from 'src/domain/usecase/GetPagesUsecase';
import { mock } from 'vitest-mock-extended';

import type { ObsidianAdapter } from '../domain/adapter/ObsidianAdapter';
import type { WasmAdapter } from '../domain/adapter/WasmAdapter';
import { GetPagesUsecaseImpl } from './GetPagesUsecase';

describe('GetPagesUsecaseImpl', () => {
  const obsidianAdapter = mock<ObsidianAdapter>();
  const wasmAdapter = mock<WasmAdapter>();
  let getPageUsecase: GetPagesUsecase;

  beforeEach(async () => {
    wasmAdapter.getSummarizedDescription.mockReturnValue([[]]);
    obsidianAdapter.getMetadata.mockReturnValue({ resolvedLinks: [], unresolvedLinks: [], tags: [] });
    obsidianAdapter.cachedRead.mockResolvedValue('');
    obsidianAdapter.getMarkdownFiles.mockReturnValue([
      {
        basename: 'a',
        extension: 'md',
        name: 'a.md',
        path: 'test/a.md',
        stat: {
          ctime: 0,
          mtime: 20,
          size: 100,
        },
      },
      {
        basename: 'b',
        extension: 'md',
        name: 'b.md',
        path: 'test/b.md',
        stat: {
          ctime: 10,
          mtime: 10,
          size: 100,
        },
      },
    ]);

    getPageUsecase = await GetPagesUsecaseImpl.init(obsidianAdapter, wasmAdapter);
  });

  it(`should return hasMore as true when it has more pages`, async () => {
    const { cards, hasMore } = await getPageUsecase.invoke({
      page: 0,
      size: 1,
      pinStarred: true,
      search: '',
      sort: 'modified-new-to-old',
    });

    expect(hasMore).toBeTruthy();
    expect(cards.map((card) => card.title)).toEqual(['a']);
  });

  it(`should return hasMore as false if it has no more pages`, async () => {
    const { cards, hasMore } = await getPageUsecase.invoke({
      page: 1,
      size: 1,
      pinStarred: true,
      search: '',
      sort: 'modified-new-to-old',
    });

    expect(hasMore).toBeFalsy();
    expect(cards.map((card) => card.title)).toEqual(['b']);
  });

  it(`should search by file path`, async () => {
    obsidianAdapter.createSearchFun.mockReturnValue((text) => {
      if (text == 'test/a.md ') {
        return { score: 1.0 };
      } else {
        return undefined;
      }
    });

    const { cards } = await getPageUsecase.invoke({
      page: 0,
      size: 10,
      pinStarred: true,
      search: 'a',
      sort: 'modified-old-to-new',
    });

    expect(cards.map((card) => card.title)).toEqual(['a']);
  });

  it(`should search by tag`, async () => {
    obsidianAdapter.createSearchFun.mockReturnValue((text) => {
      if (text == 'test/a.md #tag') {
        return { score: 1.0 };
      } else {
        return undefined;
      }
    });

    obsidianAdapter.getMetadata.mockImplementation((file) => {
      if (file.basename == 'a') {
        return {
          resolvedLinks: [],
          unresolvedLinks: [],
          tags: ['tag'],
        };
      } else {
        return {
          resolvedLinks: [],
          unresolvedLinks: [],
          tags: [],
        };
      }
    });

    const { cards } = await getPageUsecase.invoke({
      page: 0,
      size: 10,
      pinStarred: true,
      search: '#tag',
      sort: 'modified-old-to-new',
    });

    expect(cards.map((card) => card.title)).toEqual(['a']);
  });

  it(`should pin starred cards`, async () => {
    const a = {
      basename: 'a',
      extension: 'md',
      name: 'a.md',
      path: 'test/a.md',
      stat: {
        ctime: 0,
        mtime: 100,
        size: 100,
      },
    };

    obsidianAdapter.getMarkdownFiles.mockReturnValue([
      a,
      {
        basename: 'b',
        extension: 'md',
        name: 'b.md',
        path: 'test/b.md',
        stat: {
          ctime: 0,
          mtime: 0,
          size: 100,
        },
      },
    ]);

    obsidianAdapter.pluginEnabled.calledWith('starred').mockReturnValue(true);
    obsidianAdapter.getStarredFile.mockReturnValue([a]);

    const { cards } = await getPageUsecase.invoke({
      page: 0,
      size: 10,
      pinStarred: true,
      search: '',
      sort: 'modified-new-to-old',
    });

    expect(cards.length).toBe(2);

    const { title, star } = cards[0];

    expect(title).toBe('a');
    expect(star).toBe(true);
  });
});

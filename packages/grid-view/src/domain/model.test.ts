import type { File } from './adapter/ObsidianAdapter';
import { type SortItem, createSortFn } from './model';

describe('createSortFn', () => {
  it('should sort by file-name-a-to-z and file-name-z-to-a', async () => {
    const a: SortItem = {
      file: { ...dummyFile, name: 'a' },
    };
    const b: SortItem = {
      file: { ...dummyFile, name: 'b' },
    };
    {
      const sortFn = createSortFn(true, 'file-name-a-to-z');
      expect(sortFn(a, b)).toBeLessThan(0);
    }
    {
      const sortFn = createSortFn(true, 'file-name-z-to-a');
      expect(sortFn(a, b)).toBeGreaterThan(0);
    }
  });

  it('should sort by created-new-to-old and created-old-to-new', async () => {
    const a: SortItem = {
      file: { ...dummyFile, stat: { ctime: 100, mtime: 0, size: 0 } },
    };
    const b: SortItem = {
      file: { ...dummyFile, stat: { ctime: 0, mtime: 0, size: 0 } },
    };

    {
      const sortFn = createSortFn(true, 'created-new-to-old');
      expect(sortFn(a, b)).toBeLessThan(0);
    }
    {
      const sortFn = createSortFn(true, 'created-old-to-new');
      expect(sortFn(a, b)).toBeGreaterThan(0);
    }
  });

  it('should sort by modified-new-to-old and modified-old-to-new', async () => {
    const a: SortItem = {
      file: { ...dummyFile, stat: { ctime: 0, mtime: 100, size: 0 } },
    };
    const b: SortItem = {
      file: { ...dummyFile, stat: { ctime: 0, mtime: 0, size: 0 } },
    };
    {
      const sortFn = createSortFn(true, 'modified-new-to-old');
      expect(sortFn(a, b)).toBeLessThan(0);
    }
    {
      const sortFn = createSortFn(true, 'modified-old-to-new');
      expect(sortFn(a, b)).toBeGreaterThan(0);
    }
  });

  it(`should sort by most-linked and least-linked`, async () => {
    const a: SortItem = {
      file: dummyFile,
      meta: { resolvedLinks: [dummyFile], unresolvedLinks: [], tags: [] },
    };
    const b: SortItem = {
      file: dummyFile,
      meta: { resolvedLinks: [], unresolvedLinks: [], tags: [] },
    };
    {
      const sortFn = createSortFn(true, 'most-linked');
      expect(sortFn(a, b)).toBeLessThan(0);
    }
    {
      const sortFn = createSortFn(true, 'least-linked');
      expect(sortFn(a, b)).toBeGreaterThan(0);
    }
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

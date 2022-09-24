import type { WasmAdapter } from 'src/domain/adapter/WasmAdapter';
import type { GetPagesUsecase, GetPagesUsecaseInput, GetPagesUsecaseOutput } from 'src/domain/usecase/GetPagesUsecase';

import type { File, ObsidianAdapter } from '../domain/adapter/ObsidianAdapter';
import { YAMLFrontMatter, createSortFn } from '../domain/model';
import type { ICard } from '../domain/model';

export class GetPagesUsecaseImpl implements GetPagesUsecase {
  private constructor(private obsidianAdapter: ObsidianAdapter, private wasmAdapter: WasmAdapter) {}

  static async init(obsidianAdapter: ObsidianAdapter, wasmAdapter: WasmAdapter): Promise<GetPagesUsecase> {
    const obj = new GetPagesUsecaseImpl(obsidianAdapter, wasmAdapter);
    return obj;
  }

  async invoke(input: GetPagesUsecaseInput): Promise<GetPagesUsecaseOutput> {
    const { page, size, search, sort, pinStarred } = input;

    // console.debug(`GetPage: ${size * page} - ${size * (page + 1)}`, input);

    const sortFn = createSortFn(pinStarred, sort);

    const starredPathes = this.obsidianAdapter.pluginEnabled('starred')
      ? this.obsidianAdapter.getStarredFile().map((f) => {
          return f.path;
        })
      : undefined;

    const searchFun = this.obsidianAdapter.createSearchFun(search);

    const iter = this.obsidianAdapter
      .getMarkdownFiles()
      .filter((file) => file.extension === 'md')
      .map((file) => {
        const star = starredPathes?.includes(file.path);
        const meta = this.obsidianAdapter.getMetadata(file);
        return {
          file,
          star,
          meta,
        };
      })
      .filter(({ file, meta }) => {
        if (search) {
          // search by file.path and #tag
          // e.g. #a #b #c
          const tags = meta.tags
            .map((tag) => {
              return `#${tag}`;
            })
            .join(' ');
          const ret = searchFun(`${file.path} ${tags}`);
          return ret !== undefined;
        } else {
          return true;
        }
      })
      .sort(sortFn);

    const cards = await Promise.all(iter.slice(size * page, size * (page + 1)).map(this.createCard));

    return {
      cards,
      hasMore: size * (page + 1) < iter.length,
    };
  }

  private createCard = async (input: { file: File; star?: boolean }): Promise<ICard> => {
    const { file, star } = input;
    let content = await this.obsidianAdapter.cachedRead(file);
    content = content.replace(YAMLFrontMatter, ''); // remove front matter

    const title = file.basename;

    const description = this.wasmAdapter.getSummarizedDescription(content);

    const icon = this.obsidianAdapter.getFirstImage(file, content);

    return {
      title,
      icon,
      description,
      path: file.path,
      star,
      onClick: async () => {
        await this.obsidianAdapter.openFile(file);
      },
      toggleStar: () => {
        this.obsidianAdapter.toggleFileStar(file);
      },
      trash: () => {
        this.obsidianAdapter.trash(file, true);
      },
    };
  };
}

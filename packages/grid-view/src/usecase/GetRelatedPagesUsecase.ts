import type { WasmAdapter } from 'src/domain/adapter/WasmAdapter';
import type {
  GetRelatedPagesUsecase,
  GetRelatedPagesUsecaseInput,
  GetRelatedPagesUsecaseOutput,
} from 'src/domain/usecase/GetRelatedPagesUsecase';

import type { File, ObsidianAdapter } from '../domain/adapter/ObsidianAdapter';
import { YAMLFrontMatter, createSortFn } from '../domain/model';
import type { ICard } from '../domain/model';

const MAX_CARDS = 100;

export class GetRelatedPagesUsecaseImpl implements GetRelatedPagesUsecase {
  private constructor(private obsidianAdapter: ObsidianAdapter, private wasmAdapter: WasmAdapter) {}

  static async init(obsidianAdapter: ObsidianAdapter, wasmAdapter: WasmAdapter): Promise<GetRelatedPagesUsecase> {
    const obj = new GetRelatedPagesUsecaseImpl(obsidianAdapter, wasmAdapter);
    return obj;
  }

  async invoke(input: GetRelatedPagesUsecaseInput): Promise<GetRelatedPagesUsecaseOutput> {
    const { sort, pinStarred } = input;

    // console.debug(`GetPage: ${size * page} - ${size * (page + 1)}`, input);

    const starredPathes = this.obsidianAdapter.pluginEnabled('starred')
      ? this.obsidianAdapter.getStarredFile().map((f) => {
          return f.path;
        })
      : undefined;

    const sortFn = createSortFn(pinStarred, sort);

    const currentFile = this.obsidianAdapter.getActiveFile();

    const { unresolvedLinks, resolvedLinks, tags } = this.obsidianAdapter.getMetadata(currentFile);

    const tagCards: Record<string, ICard[]> = {};
    tags.slice(0, MAX_CARDS).forEach((tag) => {
      tagCards[tag] = [];
    });

    const tagIter = await Promise.all(
      this.obsidianAdapter
        .getMarkdownFiles()
        .map((file) => {
          const star = starredPathes?.includes(file.path);
          const meta = this.obsidianAdapter.getMetadata(file);
          return {
            file,
            star,
            meta,
          };
        })
        .sort(sortFn)
        .map(async ({ file, star, meta }) => {
          if (currentFile == file) return {};
          const a = new Set(tags);
          const b = new Set(meta.tags);
          for (const tag of a) {
            if (b.has(tag)) {
              const card = await this.createCard({ file, star });
              return { card, tag };
            }
          }
          return {};
        }),
    );

    tagIter.forEach(({ card, tag }) => {
      if (!tag) return;
      tagCards[tag].push(card);
    });

    const iter = [...new Set(resolvedLinks)] // remove duplicate links
      .map((file) => {
        const star = starredPathes?.includes(file.path);
        const meta = this.obsidianAdapter.getMetadata(file);
        return {
          file,
          star,
          meta,
        };
      })
      .sort(sortFn);

    const resolvedLinkCards = await Promise.all(iter.slice(0, MAX_CARDS).map(this.createCard));

    const unresolvedLinkCards = unresolvedLinks
      .filter((link) => {
        // skip links to heading/block (e.g. [[test#^abc]])
        return !link.includes('#');
      })
      .slice(0, MAX_CARDS)
      .map((link) => {
        return {
          title: link,
          path: link,
          description: [[]],
          onClick: async () => {
            const file = await this.obsidianAdapter.createFile(link);
            await this.obsidianAdapter.openFile(file);
          },
          toggleStar: () => {},
          trash: () => {},
        } as ICard;
      });

    return {
      resolvedLinkCards,
      unresolvedLinkCards,
      tagCards,
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

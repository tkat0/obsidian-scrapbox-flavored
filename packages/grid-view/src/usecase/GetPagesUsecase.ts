import type { CachedMetadata, TFile } from 'obsidian';

import init, { MarkdownConverter } from '@obsidian-scrapbox-flavored/grid-view-core';
import type { Config, Description } from '@obsidian-scrapbox-flavored/grid-view-core';
import wasm from '@obsidian-scrapbox-flavored/grid-view-core/pkg/grid_view_core_bg.wasm';

import type { ObsidianAdapter } from '../adapter/ObsidianAdapter';
import type { ICard } from '../model';

const YAMLFrontMatter = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3}\n)/;

export interface GetPagesUsecase {
    invoke: (input: GetPagesUsecaseInput) => Promise<ICard[]>;
}

export interface GetPagesUsecaseInput {
    page: number;
    size: number;
    search: string;
    sort: SortKind;
    pinStarred: boolean;
}

// TODO: sort by file size
// TODO: view count
export type SortKind =
    | 'file-name-a-to-z'
    | 'file-name-z-to-a'
    | 'modified-new-to-old'
    | 'modified-old-to-new'
    | 'created-new-to-old'
    | 'created-old-to-new'
    | 'most-linked'
    | 'least-linked';

export const getSortTitle = (kind: SortKind): string => {
    switch (kind) {
        case 'file-name-a-to-z':
            return 'File name (Z to A)';
        case 'file-name-z-to-a':
            return 'File name (A to Z)';
        case 'created-new-to-old':
            return 'Created time (new to old)';
        case 'created-old-to-new':
            return 'Created time (old to new)';
        case 'modified-new-to-old':
            return 'Modified time (new to old)';
        case 'modified-old-to-new':
            return 'Modified time (old to new)';
        case 'most-linked':
            return 'Most Linked';
        case 'least-linked':
            return 'Least Linked';
    }
};

export class GetPagesUsecaseImpl implements GetPagesUsecase {
    private constructor(private obsidianAdapter: ObsidianAdapter) {}

    static async init(obsidianAdapter: ObsidianAdapter): Promise<GetPagesUsecase> {
        const obj = new GetPagesUsecaseImpl(obsidianAdapter);
        await init(wasm);
        return obj;
    }

    async invoke(input: GetPagesUsecaseInput): Promise<ICard[]> {
        const { page, size, search, sort, pinStarred } = input;

        console.debug(`GetPage: ${size * page} - ${size * (page + 1) - 1}`, input);

        const starredPathes = this.obsidianAdapter.pluginEnabled('starred')
            ? this.obsidianAdapter.getStarredFile().map((f) => {
                  return f.path;
              })
            : undefined;

        const searchFun = this.obsidianAdapter.createSearchFun(search);

        const cards = await Promise.all(
            this.obsidianAdapter
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
                        const tags = meta?.tags
                            ?.map(({ tag }) => {
                                return `#${tag}`;
                            })
                            .join(' ');
                        const ret = searchFun(`${file.path} ${tags}`);
                        return ret !== null;
                    } else {
                        return true;
                    }
                })
                .sort((a, b) => {
                    // 1. sorted by star
                    // file with star is always first
                    if (pinStarred) {
                        if (a.star && !b.star) {
                            return -1;
                        } else if (!a.star && b.star) {
                            return 1;
                        }
                    }
                    // 2. sorted by date
                    const al = a.meta?.links?.length ?? 0;
                    const bl = b.meta?.links?.length ?? 0;
                    switch (sort) {
                        case 'file-name-a-to-z':
                            return a.file.name.localeCompare(b.file.name);
                        case 'file-name-z-to-a':
                            return b.file.name.localeCompare(a.file.name);
                        case 'created-new-to-old':
                            return b.file.stat.ctime - a.file.stat.ctime;
                        case 'created-old-to-new':
                            return a.file.stat.ctime - b.file.stat.ctime;
                        case 'modified-new-to-old':
                            return b.file.stat.mtime - a.file.stat.mtime;
                        case 'modified-old-to-new':
                            return a.file.stat.mtime - b.file.stat.mtime;
                        case 'most-linked':
                            return bl - al;
                        case 'least-linked':
                            return al - bl;
                    }
                })
                .slice(size * page, size * (page + 1) - 1)
                .map(this.createCard),
        );

        return cards;
    }

    private createCard = async (input: { file: TFile; star?: boolean; meta?: CachedMetadata }): Promise<ICard> => {
        const { file, star } = input;

        const config: Config = {
            heading1Mapping: 3,
            boldToHeading: false,
            indent: {
                type: 'Space',
                size: 4,
            },
        };

        let content = await this.obsidianAdapter.cachedRead(file);
        content = content.replace(YAMLFrontMatter, ''); // remove front matter

        const title = file.basename;

        // get 5 lines except new line
        let description: Description[][] = [];
        try {
            const conveter = new MarkdownConverter(content + '\n', config);
            description = conveter.description(5);
        } catch (error) {
            // console.error(title, error);
        }

        // TODO: rewrite with visitor
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

import React, { useEffect, useState } from "react";
import { FileSystemAdapter, MetadataCache, TFile, Vault } from "obsidian";

import { CardProps } from "src/components/Card";

import { useApp } from "./useApp";

enum SortKind {
    DateUpdatedDesc,
    DateCreatedDesc,
}

export const useItem = (): CardProps[] => {
    const { vault, workspace, metadataCache } = useApp();
    const [itemStates, setItemStates] = useState<CardProps[]>([]);

    const sortKind: SortKind = SortKind.DateUpdatedDesc;

    // TODO(tkat0): Reload when markdown files is modified.
    useEffect(() => {
        (async () => {
            const states: CardProps[] = await Promise.all(
                vault
                    .getMarkdownFiles()
                    // TODO(tkat0): allow user to add filters.
                    // 	For example, I want to disable `*.excalidraw.md`.
                    .filter((file) => file.extension === "md")
                    .sort((a, b) => {
                        // TODO(tkat0): Prioritize Cards with star if available
                        switch (sortKind) {
                            case SortKind.DateUpdatedDesc:
                                if (a.stat.mtime < b.stat.mtime) {
                                    return 1;
                                } else if (a.stat.mtime > b.stat.mtime) {
                                    return -1;
                                } else {
                                    return 0;
                                }
                        }
                    })
                    // TODO(tkat0): Pagenation
                    .map(async (file) => {
                        const content = await vault.cachedRead(file);

                        const title = file.basename;

                        // get 5 lines except new line
                        // TODO(tkat0): render markdown if possible or convert to plane text
                        const description = content
                            .split("\n")
                            .filter((line) => line.length > 0)
                            .slice(0, 5);

                        const thumbnail = getFirstImage(
                            vault,
                            metadataCache,
                            file,
                            content
                        );

                        return {
                            title,
                            thumbnail,
                            description,
                            onClick: async () => {
                                await workspace
                                    .getLeaf(true)
                                    .openFile(file, { active: true });
                            },
                        };
                    })
            );
            setItemStates(states);
        })();
    }, [vault]);

    return itemStates;
};

const getFirstImage = (
    vault: Vault,
    metadataCache: MetadataCache,
    file: TFile,
    content: string
): string | undefined => {
    const [lImg, lPos] = getFirstLocalImage(vault, metadataCache, file);
    const [rImg, rPos] = getFirstRemoteImage(content);

    // TODO(tkat0): Support excaildraw

    if (lImg && rImg) {
        return lPos < rPos ? lImg : rImg;
    } else if (lImg && !rImg) {
        return lImg;
    } else if (!lImg && rImg) {
        return rImg;
    } else {
        return undefined;
    }
};

// TODO(tkat0): doesn't work on iOS
const getFirstLocalImage = (
    vault: Vault,
    metadataCache: MetadataCache,
    file: TFile
): [string, number] | [undefined, undefined] => {
    const cachedMetadata = metadataCache.getFileCache(file);
    for (const embed of cachedMetadata?.embeds ?? []) {
        const ext = embed.link.split(".").pop();
        if (["png", "jpg", "jpeg", "gif"].includes(ext)) {
            if (vault.adapter instanceof FileSystemAdapter) {
                return [
                    "app://local" +
                        vault.adapter.getBasePath() +
                        file.parent.path +
                        embed.link,
                    embed.position.start.line,
                ];
            }
        }
    }
    return [undefined, undefined];
};

const getFirstRemoteImage = (
    content: string
): [string, number] | [undefined, undefined] => {
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const result = line.match(/!\[.*]\((?<url>.*)\)/);
        if (result?.groups) {
            const url = result.groups["url"];
            if (url) return [url, i];
        }
    }
    return [undefined, undefined];
};

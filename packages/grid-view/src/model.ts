import type { Description } from '@obsidian-scrapbox-flavored/grid-view-core';

export interface ICard {
    title: string;
    description: Description[][];
    icon?: string;
    path: string;
    star?: boolean;
    onClick: () => Promise<void>;
    toggleStar: () => void;
    trash: () => void;
}

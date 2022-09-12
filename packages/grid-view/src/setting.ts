import type { SortKind } from './usecase/GetPagesUsecase';

export interface GridViewSettings {
  sort: SortKind;
  pinStarred: boolean;
}

export const DEFAULT_SETTINGS: GridViewSettings = {
  sort: 'modified-new-to-old',
  pinStarred: true,
};

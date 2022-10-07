import type { ICard, SortKind } from '../model';

export interface GetPagesUsecase {
  invoke: (input: GetPagesUsecaseInput) => Promise<GetPagesUsecaseOutput>;
}

export interface GetPagesUsecaseInput {
  page: number;
  size: number;
  search: string;
  sort: SortKind;
  pinStarred: boolean;
}

export interface GetPagesUsecaseOutput {
  cards: ICard[];
  hasMore: boolean;
  total: number;
}

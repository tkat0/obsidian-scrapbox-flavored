import type { ICard, SortKind } from '../model';

export interface GetRelatedPagesUsecase {
  invoke: (input: GetRelatedPagesUsecaseInput) => Promise<GetRelatedPagesUsecaseOutput>;
}

export interface GetRelatedPagesUsecaseInput {
  sort: SortKind;
  pinStarred: boolean;
}

export interface GetRelatedPagesUsecaseOutput {
  resolvedLinkCards: ICard[];
  unresolvedLinkCards: ICard[];
  tagCards: Record<string, ICard[]>;
}

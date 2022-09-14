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

export interface Description {
  kind: 'normal' | 'code' | 'link' | 'emphasis' | 'image';
  value: string;
}
[];

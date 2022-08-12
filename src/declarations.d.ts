export interface CustomCard {
  type: string;
  name: string;
  preview?: boolean;
  description?: string;
}

export interface CustomIcon {
  path: string;
  viewBox?: string;
}

export interface IconGetter {
  (name: string): CustomIcon; // could be a promise
}

export interface CustomIconSets {
  [SetName: string]: IconGetter;
}

declare global {
  interface Window {
    customIcons: any;
    customIconsets?: CustomIconSets;
    customCards?: CustomCard[];
  }
}

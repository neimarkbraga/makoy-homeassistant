import { isDevelopment } from '../libs/debug';

export interface CardDetailsArgs {
  elementName: string;
  displayName: string;
  description: string;
}

export const buildCardDetails = (args: CardDetailsArgs) => ({
  ELEMENT_NAME: (isDevelopment ? 'dev-' : '') + args.elementName,
  DISPLAY_NAME: (isDevelopment ? '[dev] ' : '') + args.displayName,
  DESCRIPTION: (isDevelopment ? '[dev] ' : '') + args.description
});

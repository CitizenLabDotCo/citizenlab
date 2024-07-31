import { TLayout } from '..';

import { TCardSize } from './PublicationStatusTabs';

const SIZES_FIRST_SIX_CARDS: TCardSize[] = [
  'large',
  'medium',
  'medium',
  'small',
  'small',
  'small',
];

const DYNAMIC_DESKTOP_CARD_SIZES_MAP = new Map<number, TCardSize[]>([
  [1, ['large']],
  [2, ['medium', 'medium']],
  [3, ['large', 'medium', 'medium']],
  [4, ['large', 'small', 'small', 'small']],
  [5, ['medium', 'medium', 'small', 'small', 'small']],
  [6, SIZES_FIRST_SIX_CARDS],
]);

interface Params {
  listLength: number;
  index: number;
  isSmallerThanTablet: boolean;
  layout: TLayout;
}

export const getCardSize = ({
  listLength,
  index,
  isSmallerThanTablet,
  layout,
}: Params) => {
  // If we have a three column layout,
  // or if we are on a screen smaller than a tablet,
  // we always return 'small' size.
  if (layout === 'threecolumns') return 'small';
  if (isSmallerThanTablet) return 'small';

  // Otherwise, it depends on how many cards we have in the list.
  // If we have 1-6 cards, the cards will have the sizes as
  // defined in DYNAMIC_DESKTOP_CARD_SIZES_MAP.
  // If we have more than 6 cards, the first 6 cards will have the
  // sizes as defined in SIZES_FIRST_SIX_CARDS, and the rest will be 'small'.
  const cardSizes =
    DYNAMIC_DESKTOP_CARD_SIZES_MAP.get(listLength) ?? SIZES_FIRST_SIX_CARDS;
  return cardSizes[index] ?? 'small';
};

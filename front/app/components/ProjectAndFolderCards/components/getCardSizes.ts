import { TCardSize } from './PublicationStatusTabs';

export default function getCardSizes(
  adminPublicationsLength: number,
  isLargerThanTablet: boolean
): TCardSize[] {
  const initialCount = Math.min(adminPublicationsLength, 6);
  const indices = Array(adminPublicationsLength)
    .fill(0)
    .map((_, i) => i);

  const cardSizes = indices.map((index) => {
    let cardSize: TCardSize = 'small';

    if (index < 6 && isLargerThanTablet) {
      if (initialCount === 1 && index === 0) {
        cardSize = 'large';
      } else if (initialCount === 2) {
        cardSize = 'medium';
      } else if (initialCount === 3) {
        if (index === 0) {
          cardSize = 'large';
        } else {
          cardSize = 'medium';
        }
      } else if (initialCount === 4 && index === 0) {
        cardSize = 'large';
      } else if (initialCount === 5 && (index === 0 || index === 1)) {
        cardSize = 'medium';
      } else if (initialCount === 6) {
        if (index === 0) {
          cardSize = 'large';
        } else if (index === 1 || index === 2) {
          cardSize = 'medium';
        }
      }
    }

    return cardSize;
  });

  return cardSizes;
}

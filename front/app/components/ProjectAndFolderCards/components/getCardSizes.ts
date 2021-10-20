import { size } from 'lodash-es';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { TCardSize } from './ProjectsList';
import { viewportWidths } from 'utils/styleUtils';

export default function getCardSizes(
  adminPublicationsList: IAdminPublicationContent[],
  windowWidth: number
): TCardSize[] {
  const initialCount = size(adminPublicationsList.slice(0, 6));
  const isOdd = (number: number) => number % 2 === 1;
  const biggerThanSmallTablet = windowWidth >= viewportWidths.smallTablet;
  const biggerThanLargeTablet = windowWidth >= viewportWidths.largeTablet;

  const cardSizes = adminPublicationsList.map((_project, index) => {
    let cardSize: 'small' | 'medium' | 'large' =
      biggerThanSmallTablet && !biggerThanLargeTablet ? 'medium' : 'small';

    if (index < 6) {
      if (biggerThanSmallTablet && !biggerThanLargeTablet) {
        if (
          (!isOdd(initialCount) && (index === 0 || index === 1)) ||
          (isOdd(initialCount) && index === 0)
        ) {
          cardSize = 'large';
        }
      }

      if (biggerThanLargeTablet) {
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
    }

    return cardSize;
  });

  return cardSizes;
}

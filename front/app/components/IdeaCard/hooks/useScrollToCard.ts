import { useEffect } from 'react';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import eventEmitter from 'utils/eventEmitter';
import { scrollToElement } from 'utils/scroll';

const SCROLL_OFFSETS = {
  MOBILE: 150,
  DESKTOP: 300,
} as const;

/*
 * useScrollToCard:
 * Hook that handles scrolling to a card with project page image loading considerations.
 * Automatically subscribes to image loaded events and cleans up on unmount.
 */
export const useScrollToCard = (
  cardId: string | undefined,
  smallerThanPhone: boolean
) => {
  useEffect(() => {
    if (!cardId) return;

    const performScroll = () =>
      scrollToCardAndCleanUpUrl(cardId, smallerThanPhone);

    // Get the project page body, which holds the project description
    const projectPageBody = document.getElementById('e2e-project-page-body');

    // Check if the project page images are loaded,
    // if so, perform scroll immediately.
    if (projectPageBody && checkImagesLoaded(projectPageBody)) {
      performScroll();
      return;
    }

    // Otherwise, images still loading. Wait for the images loaded event before scrolling.
    const subscription = eventEmitter
      .observeEvent(IMAGES_LOADED_EVENT)
      .subscribe(() => {
        performScroll();
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [cardId, smallerThanPhone]);
};

/*
 * scrollToCardAndCleanUpUrl:
 * Function to scroll to the card and clean up the search params.
 */
const scrollToCardAndCleanUpUrl = (
  ideaId: string,
  smallerThanPhone: boolean
) => {
  scrollToElement({
    id: ideaId,
    behavior: 'auto',
    offset: smallerThanPhone ? SCROLL_OFFSETS.MOBILE : SCROLL_OFFSETS.DESKTOP,
  });
  removeSearchParams(['scroll_to_card']);
};

/*
 * checkImagesLoaded:
 * Checks if the project page images have finished loading.
 */
const checkImagesLoaded = (projectPageBody: Element): boolean => {
  // First, check if all images on the project page are loaded.
  // If they are, we've missed the IMAGES_LOADED_EVENT which has already
  // been emitted, so we can perform the scroll right away after checking.
  const images = projectPageBody.querySelectorAll('img');

  // If there are no images, return true
  if (images.length === 0) {
    return true;
  }

  // Check if all images are loaded
  return Array.from(images).every((img) => img.complete);
};

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import eventEmitter from 'utils/eventEmitter';
import { scrollToElement } from 'utils/scroll';

const SCROLL_OFFSETS = {
  MOBILE: 150,
  DESKTOP: 300,
} as const;

/*
 * handleScrollToCard:
 * Handles the scroll-to-card with project description image loading considerations.
 */
export const handleScrollToCard = (
  cardId: string,
  smallerThanPhone: boolean
): (() => void) => {
  // Define the scroll function
  const performScroll = () =>
    scrollToCardAndCleanUpUrl(cardId, smallerThanPhone);

  // Get the project description element
  const projectDescription = document.querySelector(
    '[id^="project-description"]'
  );

  // Check if project description images are loaded,
  // if so, perform scroll immediately.
  if (
    projectDescription &&
    checkImagesLoadedAndHandleScroll(projectDescription, performScroll)
  ) {
    return () => {}; // No cleanup needed
  }

  // Otherwise, images still loading. Wait for the images loaded event before scrolling.
  return subscribeToImagesLoadedEvent(performScroll);
};

/*
 * scrollToCardAndCleanUpUrl:
 * Function to scroll to the card and clean up the search params.
 */
export const scrollToCardAndCleanUpUrl = (
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
 * checkImagesLoadedAndHandleScroll:
 * Checks if project description images have finished loading.
 */
export const checkImagesLoadedAndHandleScroll = (
  projectDescription: Element,
  performScroll: () => void
): boolean => {
  // First, check if all images in the project description are loaded.
  // If they are, we've likely missed the IMAGES_LOADED_EVENT which has already
  // been emitted, so we can perform the scroll right away after checking.

  const imagesInDescription = projectDescription.querySelectorAll('img');

  // If there are no images, we can scroll to the card.
  if (imagesInDescription.length === 0) {
    performScroll();
    return true;
  }

  // Check if all images are loaded
  const allImagesLoaded = Array.from(imagesInDescription).every((img) => {
    const isLoaded = img.complete;
    return isLoaded;
  });

  if (allImagesLoaded) {
    // All images in description are loaded, scroll immediately
    performScroll();
    return true;
  }
  return false;
};

/*
 * subscribeToImagesLoadedEvent:
 * Subscribes to the IMAGES_LOADED_EVENT and executes the callback when the event is emitted.
 */
export const subscribeToImagesLoadedEvent = (
  callback: () => void
): (() => void) => {
  const subscription = eventEmitter
    .observeEvent(IMAGES_LOADED_EVENT)
    .subscribe(() => {
      callback();
      subscription.unsubscribe();
    });

  return () => {
    subscription.unsubscribe();
  };
};

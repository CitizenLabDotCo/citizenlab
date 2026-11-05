import { FocusEvent } from 'react';

import { CARD_GAP } from '../constants';

export const skipCarrousel = (endId: string) => {
  const element = document.getElementById(endId);
  element?.setAttribute('tabindex', '-1');
  element?.focus();
};

// Keep the focused card fully visible.
export const scrollFocusedCardIntoView = (
  event: FocusEvent<HTMLElement>,
  scrollContainer?: HTMLDivElement
) => {
  if (!scrollContainer) return;

  const cardRect = event.currentTarget.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();

  if (cardRect.left < containerRect.left) {
    scrollContainer.scrollLeft -= containerRect.left - cardRect.left + CARD_GAP;
  } else if (cardRect.right > containerRect.right) {
    scrollContainer.scrollLeft +=
      cardRect.right - containerRect.right + CARD_GAP;
  }
};

export const getUpdatedButtonVisibility = (
  ref: HTMLDivElement,
  hasMore: boolean
) => {
  const scrollLeft = ref.scrollLeft;
  const scrollWidth = ref.scrollWidth;
  const clientWidth = ref.clientWidth;

  const atEnd = scrollLeft >= scrollWidth - clientWidth;

  const hideNextButton = atEnd && !hasMore;
  const showNextButton = !hideNextButton;

  const atStart = scrollLeft === 0;

  return {
    showNextButton,
    showPreviousButton: !atStart,
  };
};

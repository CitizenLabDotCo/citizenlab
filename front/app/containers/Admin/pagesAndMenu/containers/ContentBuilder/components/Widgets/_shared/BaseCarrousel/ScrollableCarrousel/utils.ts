export const skipCarrousel = (endId: string) => {
  const element = document.getElementById(endId);
  element?.setAttribute('tabindex', '-1');
  element?.focus();
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

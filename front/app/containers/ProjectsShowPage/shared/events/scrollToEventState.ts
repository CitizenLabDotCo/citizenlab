let scrollToEventId: string | null = null;

export const getScrollToEventId = () => scrollToEventId;
export const setScrollToEventId = (eventId: string | null) => {
  scrollToEventId = eventId;
};

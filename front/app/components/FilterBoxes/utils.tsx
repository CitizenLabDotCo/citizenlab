export const scrollToTopIdeasList = () => {
  const ideasListPanel = document.getElementById('ideas-with-filter-sidebar');
  const boundingBox = ideasListPanel?.getBoundingClientRect();
  if (boundingBox) {
    ideasListPanel?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  }
};

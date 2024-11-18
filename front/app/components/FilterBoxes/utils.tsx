export const scrollToTopIdeasList = () => {
  const ideasListPanel = document.getElementById('ideas-list-scroll-anchor');
  const boundingBox = ideasListPanel?.getBoundingClientRect();
  if (boundingBox) {
    ideasListPanel?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  }
};

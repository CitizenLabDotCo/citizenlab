export const scrollToTopIdeasList = () => {
  const ideasListPanel = document.getElementById('ideas-list-scroll-anchor');
  ideasListPanel?.scrollIntoView({
    behavior: 'smooth',
  });
};

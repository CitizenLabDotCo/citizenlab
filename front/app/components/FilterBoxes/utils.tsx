export const scrollToTopIdeasList = () => {
  const ideasListPanel = document.getElementById('view-panel-1');
  const boundingBox = ideasListPanel?.getBoundingClientRect();
  if (boundingBox) {
    window.scrollBy(0, boundingBox.top - 100);
  }
};

import { allItems, visibleItems, hiddenItems } from '../fixtures/navbarItems';

export default jest.fn((params) => {
  if (!params) return allItems;
  if (params.visible) return visibleItems;
  return hiddenItems;
});

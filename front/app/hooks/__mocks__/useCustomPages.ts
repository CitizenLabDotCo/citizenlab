import pages from 'services/__mocks__/customPages';

export default jest.fn((ids) => {
  if (!ids) return pages;

  const idSet = new Set(ids);
  return pages.filter((page) => idSet.has(page.id));
});

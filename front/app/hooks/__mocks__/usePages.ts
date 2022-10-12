import pages from '../fixtures/staticPages';

export default jest.fn((ids) => {
  if (!ids) return pages;

  const idSet = new Set(ids);
  return pages.filter((page) => idSet.has(page.id));
});

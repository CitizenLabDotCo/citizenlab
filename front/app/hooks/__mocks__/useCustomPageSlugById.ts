import pages from '../fixtures/staticPages';

const customPageSlugById = pages.reduce((acc, page) => {
  acc[page.id] = `/pages/${page.attributes.slug}`;
  return acc;
}, {});

export default () => customPageSlugById;

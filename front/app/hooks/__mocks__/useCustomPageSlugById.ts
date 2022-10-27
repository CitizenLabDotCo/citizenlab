import pages from '../fixtures/customPages';

const customPageSlugById = pages.reduce((acc, page) => {
  acc[page.id] = `/pages/${page.attributes.slug}`;
  return acc;
}, {});

export default () => customPageSlugById;

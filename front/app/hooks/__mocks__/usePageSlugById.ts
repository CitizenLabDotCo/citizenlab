import pages from '../fixtures/pages';

const pageSlugById = pages.reduce((acc, page) => {
  acc[page.id] = `/pages/${page.attributes.slug}`;
  return acc;
}, {});

export default () => pageSlugById;

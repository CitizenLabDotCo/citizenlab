import { customPagesData } from './useCustomPages';

const customPageSlugById = customPagesData.reduce((acc, page) => {
  acc[page.id] = `/pages/${page.attributes.slug}`;
  return acc;
}, {});

export default () => customPageSlugById;

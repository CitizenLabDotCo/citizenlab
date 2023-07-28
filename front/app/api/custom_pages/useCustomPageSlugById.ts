import useCustomPages from 'api/custom_pages/useCustomPages';

export type TPageSlugById = Record<string, string>;

export default function useCustomPageSlugById() {
  const { data: pages } = useCustomPages();
  const customPageSlugById = pages?.data.reduce((acc, page) => {
    acc[page.id] = `/pages/${page.attributes.slug}`;
    return acc;
  }, {} as TPageSlugById);

  return customPageSlugById;
}

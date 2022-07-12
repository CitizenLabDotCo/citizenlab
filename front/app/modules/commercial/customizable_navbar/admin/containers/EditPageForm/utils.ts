import { IPageData, IPageUpdate } from 'services/pages';
import { FormValues } from '../../components/PageFormWithNavbarNameField';
import { INavbarItem } from 'services/navbar';

export const isPageInNavbar = (pageId: string, navbarItems: INavbarItem[]) => {
  return navbarItems.some(
    (navbarItem) => navbarItem.relationships.static_page.data?.id === pageId
  );
};

const getTitleBodyAndSlug = (obj: IPageData['attributes'] | FormValues) => ({
  title_multiloc: obj.title_multiloc,
  body_multiloc: obj.body_multiloc,
  slug: obj.slug,
});

export const createPageUpdateData = (
  page: IPageData,
  values: FormValues
): IPageUpdate => {
  const initialFormValuesPage = getTitleBodyAndSlug(page.attributes);
  const currentFormValuesPage = getTitleBodyAndSlug(values);

  return {
    ...initialFormValuesPage,
    ...currentFormValuesPage,
    nav_bar_item_attributes: {
      title_multiloc: values.nav_bar_item_title_multiloc,
    },
  };
};

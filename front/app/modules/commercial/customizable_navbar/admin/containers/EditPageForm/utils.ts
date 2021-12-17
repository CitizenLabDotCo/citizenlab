import { IPageData } from 'services/pages';
import { RemoteFiles } from 'hooks/useRemoteFiles';
import { FormValues } from '../../components/PageFormWithNavbarNameField';
import { IPageUpdate } from '../../../services/pages';

const getTitleBodyAndSlug = (obj: IPageData['attributes'] | FormValues) => ({
  title_multiloc: obj.title_multiloc,
  body_multiloc: obj.body_multiloc,
  slug: obj.slug,
});

export const getInitialFormValues = (
  page: IPageData,
  remotePageFiles: RemoteFiles
): FormValues => ({
  nav_bar_item_title_multiloc: page.attributes.nav_bar_item_title_multiloc,
  ...getTitleBodyAndSlug(page.attributes),
  local_page_files: remotePageFiles,
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

import { INavbarItem, INavbarItemUpdate } from 'api/navbar/types';
import { MAX_TITLE_LENGTH } from 'api/navbar/util';

import { truncateMultiloc } from 'utils/textUtils';

import { FormValues } from '../../components/NavbarItemForm';

export const getInitialFormValues = (navbarItem: INavbarItem): FormValues => ({
  nav_bar_item_title_multiloc: truncateMultiloc(
    navbarItem.attributes.title_multiloc,
    MAX_TITLE_LENGTH
  ),
});

export const createNavbarItemUpdateData = (
  navbarItem: INavbarItem,
  values: FormValues
): Omit<INavbarItemUpdate, 'id'> => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  title_multiloc: values.nav_bar_item_title_multiloc
    ? values.nav_bar_item_title_multiloc
    : navbarItem.attributes.title_multiloc,
});

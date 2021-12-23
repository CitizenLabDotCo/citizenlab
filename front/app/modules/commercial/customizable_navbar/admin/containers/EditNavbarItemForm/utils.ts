import { INavbarItem, MAX_TITLE_LENGTH } from 'services/navbar';
import { FormValues } from '../../components/NavbarItemForm';
import { INavbarItemUpdate } from '../../../services/navbar';
import { truncateMultiloc } from 'utils/textUtils';

export const getInitialFormValues = (navbarItem: INavbarItem): FormValues => ({
  nav_bar_item_title_multiloc: truncateMultiloc(
    navbarItem.attributes.title_multiloc,
    MAX_TITLE_LENGTH
  ),
});

export const createNavbarItemUpdateData = (
  navbarItem: INavbarItem,
  values: FormValues
): INavbarItemUpdate => ({
  title_multiloc: values.nav_bar_item_title_multiloc
    ? values.nav_bar_item_title_multiloc
    : navbarItem.attributes.title_multiloc,
});

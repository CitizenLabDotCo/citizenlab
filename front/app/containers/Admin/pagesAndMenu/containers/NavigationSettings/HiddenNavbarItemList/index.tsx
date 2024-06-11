import React, { useMemo } from 'react';

import { WrappedComponentProps } from 'react-intl';
import { RouteType } from 'routes';

import { ICustomPageData, TCustomPageCode } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';
import useCustomPageSlugById from 'api/custom_pages/useCustomPageSlugById';
import useDeleteCustomPage from 'api/custom_pages/useDeleteCustomPage';
import useAddNavbarItem from 'api/navbar/useAddNavbarItem';
import useNavbarItems from 'api/navbar/useNavbarItems';
import { getNavbarItemSlug } from 'api/navbar/util';

import NavbarItemRow from 'containers/Admin/pagesAndMenu/containers/NavigationSettings/NavbarItemRow';
import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

import { List, Row } from 'components/admin/ResourceList';

import { injectIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import getItemsNotInNavbar, { IItemNotInNavbar } from 'utils/navbar';

import Header from './Header';
import messages from './messages';

const FIXED_PAGES_SET = new Set<TCustomPageCode>([
  'terms-and-conditions',
  'privacy-policy',
  'proposals',
]);
const isNotFixedPage = (page: ICustomPageData) =>
  !FIXED_PAGES_SET.has(page.attributes.code);

const HiddenNavbarItemList = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const { mutate: deleteCustomPage } = useDeleteCustomPage();
  const { mutate: addNavbarItem } = useAddNavbarItem();
  const { data: navbarItems } = useNavbarItems();
  const { data: removedDefaultNavbarItems } = useNavbarItems({
    onlyRemovedDefaultItems: true,
  });

  const { data: pages } = useCustomPages();
  const pageSlugById = useCustomPageSlugById();

  const notAllHooksRendered =
    isNilOrError(navbarItems) ||
    isNilOrError(removedDefaultNavbarItems) ||
    isNilOrError(pages) ||
    isNilOrError(pageSlugById);

  const itemsNotInNavbar = useMemo(() => {
    if (notAllHooksRendered) return null;

    return getItemsNotInNavbar(
      navbarItems.data,
      removedDefaultNavbarItems.data,
      pages.data.filter(isNotFixedPage)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notAllHooksRendered, navbarItems, removedDefaultNavbarItems, pages]);

  if (notAllHooksRendered || isNilOrError(itemsNotInNavbar)) {
    return null;
  }

  const handleClickEditButton = (item: IItemNotInNavbar) => () => {
    if (item.type !== 'page') return;
    clHistory.push(`${ADMIN_PAGES_MENU_PATH}/pages/${item.pageId}/settings`);
  };

  const handleClickAdd = (item: IItemNotInNavbar) => () => {
    addNavbarItem(item);
  };

  const handleClickDelete = (pageId?: string) => () => {
    if (pageId === undefined) return;

    if (window.confirm(formatMessage(messages.deletePageConfirmationHidden))) {
      deleteCustomPage(pageId);
    }
  };

  const getViewButtonLink = (item: IItemNotInNavbar): RouteType | null => {
    return (
      getNavbarItemSlug(
        item.type === 'default_item' ? item.navbarCode : 'custom',
        pageSlugById,
        item.type === 'page' ? item.pageId : undefined
      ) || '/'
    );
  };

  return (
    <>
      <Header itemsNotInNavbarPresent={itemsNotInNavbar.length > 0} />

      <List key={itemsNotInNavbar.length}>
        {itemsNotInNavbar.map((item, i) => (
          <Row key={i} isLastItem={i === itemsNotInNavbar.length - 1}>
            <NavbarItemRow
              title={
                item.type === 'default_item'
                  ? item.navbarTitleMultiloc
                  : item.pageTitleMultiloc
              }
              isDefaultPage={item.type === 'default_item'}
              showEditButton={item.type !== 'default_item'}
              showAddButton
              viewButtonLink={getViewButtonLink(item) || undefined}
              onClickEditButton={handleClickEditButton(item)}
              onClickAddButton={handleClickAdd(item)}
              addButtonDisabled={navbarItems.data.length >= 7}
              onClickDeleteButton={handleClickDelete(
                item.type === 'page' ? item.pageId : undefined
              )}
            />
          </Row>
        ))}
      </List>
    </>
  );
};

export default injectIntl(HiddenNavbarItemList);

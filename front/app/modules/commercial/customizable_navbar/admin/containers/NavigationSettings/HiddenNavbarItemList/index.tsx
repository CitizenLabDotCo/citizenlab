import React, { useMemo } from 'react';

// services
import { getNavbarItemSlug } from 'services/navbar';
import { deletePage, FIXED_PAGES, IPageData, TPageCode } from 'services/pages';
import { addNavbarItem } from '../../../../services/navbar';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePages from 'hooks/usePages';
import usePageSlugById from 'hooks/usePageSlugById';
import useRemovedDefaultNavbarItems from '../../../../hooks/useRemovedDefaultNavbarItems';

// components
import { List, Row } from 'components/admin/ResourceList';
import NavbarItemRow from 'containers/Admin/pagesAndMenu/containers/NavigationSettings/NavbarItemRow';
import Header from './Header';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import getItemsNotInNavbar, { IItemNotInNavbar } from './getItemsNotInNavbar';

const FIXED_PAGES_SET = new Set<TPageCode>(FIXED_PAGES);
const isNotFixedPage = (page: IPageData) =>
  !FIXED_PAGES_SET.has(page.attributes.code);

const HiddenNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const removedDefaultNavbarItems = useRemovedDefaultNavbarItems();
  const pages = usePages();
  const pageSlugById = usePageSlugById();

  const notAllHooksRendered =
    isNilOrError(navbarItems) ||
    isNilOrError(removedDefaultNavbarItems) ||
    isNilOrError(pages) ||
    isNilOrError(pageSlugById);

  const itemsNotInNavbar = useMemo(() => {
    if (notAllHooksRendered) return null;

    return getItemsNotInNavbar(
      navbarItems,
      removedDefaultNavbarItems,
      pages.filter(isNotFixedPage)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notAllHooksRendered, navbarItems, removedDefaultNavbarItems, pages]);

  if (notAllHooksRendered || isNilOrError(itemsNotInNavbar)) {
    return null;
  }

  const handleClickEditButton = (item: IItemNotInNavbar) => () => {
    if (item.type !== 'page') return;
    clHistory.push(`${PAGES_MENU_PATH}/custom/${item.pageId}/settings`);
  };

  const handleClickAdd = (item: IItemNotInNavbar) => () => {
    addNavbarItem(item);
  };

  const handleClickDelete = (pageId?: string) => () => {
    if (pageId === undefined) return;

    if (window.confirm(formatMessage(messages.deletePageConfirmationHidden))) {
      deletePage(pageId);
    }
  };

  const getViewButtonLink = (item: IItemNotInNavbar) => {
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
              viewButtonLink={getViewButtonLink(item)}
              onClickEditButton={handleClickEditButton(item)}
              onClickAddButton={handleClickAdd(item)}
              addButtonDisabled={navbarItems.length >= 7}
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

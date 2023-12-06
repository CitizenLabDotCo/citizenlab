import React from 'react';

// services
import useDeleteCustomPage from 'api/custom_pages/useDeleteCustomPage';
import useDeleteNavbarItem from 'api/navbar/useDeleteNavbarItem';

// components
import {
  LockedRow,
  SortableList,
  SortableRow,
} from 'components/admin/ResourceList';
import { SubSectionTitle } from 'components/admin/Section';
import NavbarItemRow from 'containers/Admin/pagesAndMenu/containers/NavigationSettings/NavbarItemRow';

// hooks
import useNavbarItems from 'api/navbar/useNavbarItems';
import useCustomPageSlugById from 'api/custom_pages/useCustomPageSlugById';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// utils
import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { Item } from 'components/admin/ResourceList/SortableList';
import { getNavbarItemSlug } from 'api/navbar/util';
import useReorderNavbarItem from 'api/navbar/useReorderNavbarItems';

const VisibleNavbarItemList = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const { mutate: deleteCustomPage } = useDeleteCustomPage();
  const { mutate: removeNavbarItem } = useDeleteNavbarItem();
  const { mutate: reorderNavbarItem } = useReorderNavbarItem();
  const { data: navbarItems } = useNavbarItems();
  const pageSlugById = useCustomPageSlugById();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) {
    return null;
  }

  const handleClickEdit = (navbarItem: Item) => () => {
    // redirect to homepage edit page
    if (navbarItem?.attributes?.code && navbarItem.attributes.code === 'home') {
      clHistory.push(
        `${ADMIN_PAGES_MENU_PATH}/homepage-builder/?variant=signedOut`
      );

      return;
    }

    const pageData = navbarItem.relationships.static_page.data;

    pageData
      ? clHistory.push(`${ADMIN_PAGES_MENU_PATH}/pages/${pageData.id}/settings`)
      : clHistory.push(
          `${ADMIN_PAGES_MENU_PATH}/navbar-items/edit/${navbarItem.id}`
        );
  };

  const getViewButtonLink = (navbarItem: Item) => {
    return (
      getNavbarItemSlug(
        navbarItem.attributes.code,
        pageSlugById,
        navbarItem.relationships.static_page.data?.id
      ) || '/'
    );
  };

  const handleClickRemove = (navbarItemId: string) => () => {
    removeNavbarItem(navbarItemId);
  };

  const handleClickDelete = (pageId?: string) => () => {
    if (pageId === undefined) return;

    if (window.confirm(formatMessage(messages.deletePageConfirmationVisible))) {
      deleteCustomPage(pageId);
    }
  };

  return (
    <>
      <SubSectionTitle>
        <FormattedMessage {...messages.navigationItems} />
      </SubSectionTitle>

      <SortableList
        items={navbarItems.data}
        onReorder={(id, ordering) => reorderNavbarItem({ id, ordering })}
        lockFirstNItems={2}
      >
        {({ lockedItemsList, itemsList, handleDragRow, handleDropRow }) => (
          <>
            {lockedItemsList?.map((navbarItem, i) => (
              <LockedRow
                key={navbarItem.id}
                isLastItem={i === itemsList.length - 1}
                data-testid="locked-row"
              >
                <NavbarItemRow
                  title={navbarItem.attributes.title_multiloc}
                  isDefaultPage={navbarItem.attributes.code !== 'custom'}
                  showEditButton
                  viewButtonLink={getViewButtonLink(navbarItem)}
                  onClickEditButton={handleClickEdit(navbarItem)}
                />
              </LockedRow>
            ))}

            {itemsList.map((navbarItem, i) => (
              <SortableRow
                key={navbarItem.id}
                id={navbarItem.id}
                index={i}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
                isLastItem={i === itemsList.length - 1}
              >
                <NavbarItemRow
                  title={navbarItem.attributes.title_multiloc}
                  isDefaultPage={navbarItem.attributes.code !== 'custom'}
                  showEditButton
                  showRemoveButton
                  viewButtonLink={getViewButtonLink(navbarItem)}
                  onClickEditButton={handleClickEdit(navbarItem)}
                  onClickRemoveButton={handleClickRemove(navbarItem.id)}
                  onClickDeleteButton={handleClickDelete(
                    navbarItem.relationships.static_page.data?.id
                  )}
                />
              </SortableRow>
            ))}
          </>
        )}
      </SortableList>
    </>
  );
};

export default injectIntl(VisibleNavbarItemList);

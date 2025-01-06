import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import useDeleteCustomPage from 'api/custom_pages/useDeleteCustomPage';
import { INavbarItem } from 'api/navbar/types';
import useDeleteNavbarItem from 'api/navbar/useDeleteNavbarItem';
import useNavbarItems from 'api/navbar/useNavbarItems';
import useReorderNavbarItem from 'api/navbar/useReorderNavbarItems';
import { getNavbarItemSlug } from 'api/navbar/util';

import NavbarItemRow from 'containers/Admin/pagesAndMenu/containers/NavigationSettings/NavbarItemRow';
import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

import LockedRow from 'components/admin/ResourceList/LockedRow';
import SortableList, { Item } from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import { SubSectionTitle } from 'components/admin/Section';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from './messages';

const VisibleNavbarItemList = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const { mutate: deleteCustomPage } = useDeleteCustomPage();
  const { mutate: removeNavbarItem } = useDeleteNavbarItem();
  const { mutate: reorderNavbarItem } = useReorderNavbarItem();
  const { data: navbarItems } = useNavbarItems();

  if (!navbarItems) {
    return null;
  }

  const handleClickEdit = (navbarItem: Item) => () => {
    // redirect to homepage edit page
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    return getNavbarItemSlug(navbarItem as INavbarItem) || '/';
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
  const isProjectItem = (navbarItem: Item) => {
    return navbarItem.relationships.project.data !== null;
  };
  return (
    <Box className="intercom-admin-pages-menu-navigation-items">
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
                  onClickDeleteButton={
                    // Only show delete button for custom pages
                    !isProjectItem(navbarItem)
                      ? handleClickDelete(
                          navbarItem.relationships.static_page.data?.id
                        )
                      : undefined
                  }
                />
              </SortableRow>
            ))}
          </>
        )}
      </SortableList>
    </Box>
  );
};

export default injectIntl(VisibleNavbarItemList);

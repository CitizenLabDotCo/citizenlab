import React, { useState } from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';

import { INavbarItem } from 'api/navbar/types';
import useDeleteNavbarItem from 'api/navbar/useDeleteNavbarItem';
import useNavbarItems from 'api/navbar/useNavbarItems';
import useReorderNavbarItem from 'api/navbar/useReorderNavbarItems';
import { getNavbarItemSlug, MAX_NAVBAR_ITEMS } from 'api/navbar/util';

import PagesMenuTabs from 'containers/Admin/pagesAndMenu/components/PagesMenuTabs';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

import LockedRow from 'components/admin/ResourceList/LockedRow';
import SortableList, { Item } from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import NewMenuItemModal from '../NewMenuItemModal';

import MenuItemRow from './MenuItemRow';
import messages from './messages';

const MenuTab = () => {
  const { formatMessage } = useIntl();
  const { data: navbarItems } = useNavbarItems();
  const { mutate: removeNavbarItem } = useDeleteNavbarItem();
  const { mutate: reorderNavbarItem } = useReorderNavbarItem();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<INavbarItem | undefined>(undefined);

  if (!navbarItems) {
    return null;
  }

  const navbarIsFull = navbarItems.data.length >= MAX_NAVBAR_ITEMS;

  const openNewModal = () => {
    setEditItem(undefined);
    setModalOpen(true);
  };

  const handleClickEdit = (navbarItem: Item) => () => {
    // Home redirects to the homepage builder.
    if (navbarItem.attributes.code === 'home') {
      clHistory.push(
        `${ADMIN_PAGES_MENU_PATH}/homepage-builder/?variant=signedOut`
      );
      return;
    }

    // Dropdown ('menu') items are edited in the modal.
    if (navbarItem.attributes.code === 'menu') {
      setEditItem(navbarItem as INavbarItem);
      setModalOpen(true);
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
    // Dropdowns aren't links, so they have no view button.
    if (navbarItem.attributes.code === 'menu') return undefined;
    return getNavbarItemSlug(navbarItem as INavbarItem) || '/';
  };

  const handleClickRemove = (navbarItemId: string) => () => {
    removeNavbarItem(navbarItemId);
  };

  return (
    <PagesMenuTabs activeTab="menu">
      <SectionFormWrapper
        title={formatMessage(messages.menuTitle)}
        subtitle={formatMessage(messages.menuSubtitle)}
        rightSideCTA={
          <Tooltip
            content={formatMessage(messages.navBarMaxItems)}
            disabled={!navbarIsFull}
          >
            <Box>
              <ButtonWithLink
                buttonStyle="admin-dark"
                icon="plus-circle"
                id="e2e-new-menu-item"
                onClick={openNewModal}
                disabled={navbarIsFull}
              >
                {formatMessage(messages.newMenuItem)}
              </ButtonWithLink>
            </Box>
          </Tooltip>
        }
      >
        <Box className="intercom-admin-pages-menu-navigation-items">
          <SortableList
            items={navbarItems.data}
            onReorder={(id, ordering) => reorderNavbarItem({ id, ordering })}
            lockFirstNItems={1}
          >
            {({ lockedItemsList, itemsList, handleDragRow, handleDropRow }) => (
              <>
                {lockedItemsList?.map((navbarItem, i) => (
                  <LockedRow
                    key={navbarItem.id}
                    isLastItem={i === itemsList.length - 1}
                    data-testid="locked-row"
                  >
                    <MenuItemRow
                      title={navbarItem.attributes.title_multiloc}
                      isDefaultPage={
                        !['custom', 'menu'].includes(navbarItem.attributes.code)
                      }
                      isDropdown={navbarItem.attributes.code === 'menu'}
                      dropdownChildren={navbarItem.attributes.children}
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
                    <MenuItemRow
                      title={navbarItem.attributes.title_multiloc}
                      isDefaultPage={
                        !['custom', 'menu'].includes(navbarItem.attributes.code)
                      }
                      isDropdown={navbarItem.attributes.code === 'menu'}
                      dropdownChildren={navbarItem.attributes.children}
                      viewButtonLink={getViewButtonLink(navbarItem)}
                      onClickEditButton={handleClickEdit(navbarItem)}
                      showRemoveButton
                      onClickRemoveButton={handleClickRemove(navbarItem.id)}
                    />
                  </SortableRow>
                ))}
              </>
            )}
          </SortableList>
        </Box>
      </SectionFormWrapper>

      <NewMenuItemModal
        key={editItem?.id ?? 'new'}
        opened={modalOpen}
        editItem={editItem}
        onClose={() => {
          setModalOpen(false);
          setEditItem(undefined);
        }}
      />
    </PagesMenuTabs>
  );
};

export default MenuTab;

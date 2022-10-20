import React from 'react';

import { List, Row } from 'components/admin/ResourceList';
import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';
import useNavbarItems from 'hooks/useNavbarItems';
import useCustomPageSlugById from 'hooks/useCustomPageSlugById';
import { getNavbarItemSlug, INavbarItem } from 'services/navbar';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import NavbarItemRow from '../NavbarItemRow';

export default function VisibleNavbarItemList() {
  const navbarItems = useNavbarItems({ onlyDefault: true });
  const pageSlugById = useCustomPageSlugById();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) {
    return null;
  }

  const handleClickEdit = (navbarItem: INavbarItem) => () => {
    // redirect to homepage toggle page
    if (navbarItem?.attributes?.code && navbarItem.attributes.code === 'home') {
      clHistory.push(`${ADMIN_PAGES_MENU_PATH}/homepage/`);
      return;
    }

    const pageData = navbarItem.relationships.static_page.data;
    pageData
      ? clHistory.push(`${ADMIN_PAGES_MENU_PATH}/pages/${pageData.id}/settings`)
      : clHistory.push(
          `${ADMIN_PAGES_MENU_PATH}/navbar-items/edit/${navbarItem.id}`
        );
  };

  const getViewButtonLink = (navbarItem: INavbarItem) => {
    return (
      getNavbarItemSlug(
        navbarItem.attributes.code,
        pageSlugById,
        navbarItem.relationships.static_page.data?.id
      ) || '/'
    );
  };

  return (
    <List>
      {navbarItems.map((navbarItem: INavbarItem, i: number) => (
        <Row key={navbarItem.id} isLastItem={i === navbarItems.length - 1}>
          <NavbarItemRow
            title={navbarItem.attributes.title_multiloc}
            showEditButton
            viewButtonLink={getViewButtonLink(navbarItem)}
            onClickEditButton={handleClickEdit(navbarItem)}
            data-testid="navbar-item-row"
          />
        </Row>
      ))}
    </List>
  );
}

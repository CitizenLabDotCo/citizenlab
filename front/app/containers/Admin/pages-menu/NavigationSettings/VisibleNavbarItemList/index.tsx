import React from 'react';

import useNavbarItems from 'hooks/useNavbarItems';
import { getNavbarItemSlug, INavbarItem } from 'services/navbar';
import NavbarItemRow from '../../NavbarItemRow';
import { List, Row } from 'components/admin/ResourceList';
import { isNilOrError } from 'utils/helperUtils';
import usePageSlugById from 'hooks/usePageSlugById';
import clHistory from 'utils/cl-router/history';
import { PAGES_MENU_PATH } from 'containers/Admin/pages-menu/routes';

export default function VisibleNavbarItemList() {
  const navbarItems = useNavbarItems({ onlyDefault: true });
  const pageSlugById = usePageSlugById();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) {
    return null;
  }

  const handleClickEdit = (navbarItem: INavbarItem) => () => {
    const pageData = navbarItem.relationships.static_page.data;

    pageData
      ? clHistory.push(`${PAGES_MENU_PATH}/pages/edit/${pageData.id}`)
      : clHistory.push(`${PAGES_MENU_PATH}/navbar-items/edit/${navbarItem.id}`);
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
            showEditButton={navbarItem.attributes.code !== 'home'}
            viewButtonLink={getViewButtonLink(navbarItem)}
            onClickEditButton={handleClickEdit(navbarItem)}
            data-testid="navbar-item-row"
          />
        </Row>
      ))}
    </List>
  );
}

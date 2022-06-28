import React from 'react';

import useNavbarItems from 'hooks/useNavbarItems';
import { INavbarItem } from 'services/navbar';
import NavbarItemRow from '../NavbarItemRow';
import { List, Row } from 'components/admin/ResourceList';
import { isNilOrError } from 'utils/helperUtils';
import { getViewButtonLink, handleClickEdit } from '../NavbarItemRow/helpers';
import usePageSlugById from 'hooks/usePageSlugById';

export default function VisibleNavbarItemList() {
  const navbarItems = useNavbarItems({ standard: true });
  const pageSlugById = usePageSlugById();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) {
    return null;
  }

  return (
    <List>
      {!isNilOrError(navbarItems) &&
        navbarItems.map((navbarItem: INavbarItem, i: number) => (
          <Row key={navbarItem.id} isLastItem={i === navbarItems.length - 1}>
            <NavbarItemRow
              title={navbarItem.attributes.title_multiloc}
              showEditButton={navbarItem.attributes.code !== 'home'}
              viewButtonLink={getViewButtonLink(navbarItem, pageSlugById)}
              onClickEditButton={handleClickEdit(navbarItem)}
            />
          </Row>
        ))}
    </List>
  );
}

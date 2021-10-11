import React from 'react';
import { INavbarItem } from 'services/navbar';

// components
import { List, Row } from 'components/admin/ResourceList';
import NavbarItemRow from './NavbarItemRow';
import { Title, DEFAULT_ITEMS } from './VisibleNavbarItemList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  navbarItems: INavbarItem[];
  onClickAddButton?: (id: string) => void;
  addButtonDisabled?: boolean;
  onClickDeleteButton?: (pageId: string) => void;
}

export default ({
  navbarItems,
  onClickAddButton,
  addButtonDisabled,
  onClickDeleteButton,
}: Props) => (
  <>
    <Title>
      <FormattedMessage {...messages.hiddenFromNavigation} />
    </Title>

    <List key={navbarItems.length}>
      {navbarItems.map((navbarItem, i) => (
        <Row
          id={navbarItem.id}
          key={navbarItem.id}
          isLastItem={i === navbarItems.length - 1}
        >
          <NavbarItemRow
            navbarItem={navbarItem}
            isDefaultPage={DEFAULT_ITEMS.has(navbarItem.attributes.type)}
            showAddButton
            onClickAddButton={onClickAddButton}
            addButtonDisabled={addButtonDisabled}
            onClickDeleteButton={onClickDeleteButton}
          />
        </Row>
      ))}
    </List>
  </>
);

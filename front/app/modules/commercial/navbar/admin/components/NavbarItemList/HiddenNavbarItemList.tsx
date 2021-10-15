import React from 'react';
import { INavbarItem } from 'services/navbar';

// components
import { List, Row } from 'components/admin/ResourceList';
import NavbarItemRow from './NavbarItemRow';
import { Title } from './VisibleNavbarItemList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  navbarItems: INavbarItem[];
  onClickAddButton?: (id: string) => void;
  addButtonDisabled?: boolean;
  onClickDeleteButton?: (pageId: string) => void;
  onClickViewButton?: (navbarItem: INavbarItem) => void;
}

export default ({
  navbarItems,
  onClickAddButton,
  addButtonDisabled,
  onClickDeleteButton,
  onClickViewButton,
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
            isDefaultPage={navbarItem.attributes.type !== 'custom'}
            showAddButton
            onClickAddButton={onClickAddButton}
            addButtonDisabled={addButtonDisabled}
            onClickDeleteButton={onClickDeleteButton}
            onClickViewButton={onClickViewButton}
          />
        </Row>
      ))}
    </List>
  </>
);

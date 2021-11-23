import React from 'react';
import { IItemNotInNavbar } from '../../containers/getItemsNotInNavbar';

// components
import { List, Row } from 'components/admin/ResourceList';
import NavbarItemRow from './NavbarItemRow';
import { Title } from './VisibleNavbarItemList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  itemsNotInNavbar: IItemNotInNavbar[];
  onClickAddButton?: (id: string) => void;
  addButtonDisabled?: boolean;
  onClickDeleteButton?: (pageId: string) => void;
  onClickViewButton?: (navbarItem: INavbarItem) => void;
}

export default ({
  itemsNotInNavbar,
  onClickAddButton,
  addButtonDisabled,
  onClickDeleteButton,
  onClickViewButton,
}: Props) => (
  <>
    <Title>
      <FormattedMessage {...messages.hiddenFromNavigation} />
    </Title>

    <List key={itemsNotInNavbar.length}>
      {itemsNotInNavbar.map((item, i) => (
        <Row key={i} isLastItem={i === itemsNotInNavbar.length - 1}>
          <NavbarItemRow
            navbarItem={navbarItem}
            isDefaultPage={item.type === 'default_item'}
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

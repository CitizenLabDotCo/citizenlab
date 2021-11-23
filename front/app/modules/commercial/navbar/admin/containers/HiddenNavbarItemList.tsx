import React, { useMemo } from 'react';

// services
import { addNavbarItem } from '../../services/navbar';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePages from 'hooks/usePages';

// components
import { List, Row } from 'components/admin/ResourceList';
import NavbarItemRow from '../components/NavbarItemRow';
import { Title } from './VisibleNavbarItemList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getItemsNotInNavbar, { IItemNotInNavbar } from './getItemsNotInNavbar';

export default () => {
  const navbarItems = useNavbarItems();
  const pages = usePages();

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

  const itemsNotInNavbar = useMemo(() => {
    return getItemsNotInNavbar(navbarItems, pages);
  }, [navbarItems, pages]);

  const createAddNavbarItem = (item: IItemNotInNavbar) => () => {
    addNavbarItem(item);
  };

  return (
    <>
      <Title>
        <FormattedMessage {...messages.hiddenFromNavigation} />
      </Title>

      <List key={itemsNotInNavbar.length}>
        {itemsNotInNavbar.map((item, i) => (
          <Row key={i} isLastItem={i === itemsNotInNavbar.length - 1}>
            <NavbarItemRow
              isDefaultPage={item.type === 'default_item'}
              showAddButton
              onClickAddButton={createAddNavbarItem(item)}
              addButtonDisabled={addButtonDisabled}
              onClickDeleteButton={onClickDeleteButton}
              onClickViewButton={onClickViewButton}
            />
          </Row>
        ))}
      </List>
    </>
  );
};

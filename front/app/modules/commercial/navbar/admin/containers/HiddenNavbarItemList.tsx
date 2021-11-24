import React, { useMemo } from 'react';

// services
import { addNavbarItem } from '../../services/navbar';
import { deletePage } from 'services/pages';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePages from 'hooks/usePages';

// components
import { List, Row } from 'components/admin/ResourceList';
import NavbarItemRow from '../components/NavbarItemRow';
import { Title } from './VisibleNavbarItemList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getItemsNotInNavbar, { IItemNotInNavbar } from './getItemsNotInNavbar';

const HiddenNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const pages = usePages();

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

  const itemsNotInNavbar = useMemo(() => {
    return getItemsNotInNavbar(navbarItems, pages);
  }, [navbarItems, pages]);

  const createAddNavbarItem = (item: IItemNotInNavbar) => () => {
    addNavbarItem(item);
  };

  const createDeletePage = (pageId?: string) => () => {
    if (pageId === undefined) return;

    if (window.confirm(formatMessage(messages.deletePageConfirmationHidden))) {
      deletePage(pageId);
    }
  };

  const createViewPage = () => () => {};

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
              addButtonDisabled={navbarItems.length === 7}
              onClickDeleteButton={createDeletePage(
                item.type === 'page' ? item.pageId : undefined
              )}
              onClickViewButton={onClickViewButton}
            />
          </Row>
        ))}
      </List>
    </>
  );
};

export default injectIntl(HiddenNavbarItemList);

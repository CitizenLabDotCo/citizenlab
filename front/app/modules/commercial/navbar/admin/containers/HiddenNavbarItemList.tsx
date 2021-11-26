import React, { useMemo } from 'react';

// services
import { addNavbarItem } from '../../services/navbar';
import { deletePage } from 'services/pages';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import useRemovedDefaultNavbarItems from 'hooks/useRemovedDefaultNavbarItems';
import usePages from 'hooks/usePages';
import useLocale from 'hooks/useLocale';

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
import { getDefaultPageSlug, getCustomPageSlug } from './slugs';

const HiddenNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const removedDefaultNavbarItems = useRemovedDefaultNavbarItems();
  const pages = usePages();
  const locale = useLocale();

  const itemsNotInNavbar = useMemo(() => {
    if (
      isNilOrError(navbarItems) ||
      isNilOrError(removedDefaultNavbarItems) ||
      isNilOrError(pages)
    ) {
      return null;
    }

    return getItemsNotInNavbar(navbarItems, removedDefaultNavbarItems, pages);
  }, [navbarItems, removedDefaultNavbarItems, pages]);

  if (!itemsNotInNavbar) return null;

  const handleClickAdd = (item: IItemNotInNavbar) => () => {
    addNavbarItem(item);
  };

  const handleClickDelete = (pageId?: string) => () => {
    if (pageId === undefined) return;

    if (window.confirm(formatMessage(messages.deletePageConfirmationHidden))) {
      deletePage(pageId);
    }
  };

  const handleClickView = (item: IItemNotInNavbar) => () => {
    const originWithLocale = `${window.location.origin}/${locale}`;

    const slug =
      item.type === 'default_item'
        ? getDefaultPageSlug(item.navbarCode)
        : getCustomPageSlug(pages, item.pageId);

    window.open(originWithLocale + slug, '_blank');
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
              title={
                item.type === 'default_item'
                  ? item.navbarTitleMultiloc
                  : item.pageTitleMultiloc
              }
              isDefaultPage={item.type === 'default_item'}
              showAddButton
              onClickAddButton={handleClickAdd(item)}
              addButtonDisabled={navbarItems.length === 7}
              onClickDeleteButton={handleClickDelete(
                item.type === 'page' ? item.pageId : undefined
              )}
              onClickViewButton={handleClickView(item)}
            />
          </Row>
        ))}
      </List>
    </>
  );
};

export default injectIntl(HiddenNavbarItemList);

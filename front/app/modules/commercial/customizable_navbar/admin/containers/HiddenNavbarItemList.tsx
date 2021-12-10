import React, { useMemo } from 'react';

// services
import { addNavbarItem } from '../../services/navbar';
import { deletePage, IPageData, POLICY_PAGES } from 'services/pages';
import { getNavbarItemSlug } from 'services/navbar';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import useRemovedDefaultNavbarItems from '../../hooks/useRemovedDefaultNavbarItems';
import usePages from 'hooks/usePages';
import usePageSlugById from 'hooks/usePageSlugById';
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

const POLICY_PAGES_SET = new Set<string>(POLICY_PAGES);

const removePolicyAndProposalsInfoPages = (page: IPageData) => {
  const code = page.attributes.code;

  return !POLICY_PAGES_SET.has(code) && code !== 'proposals';
};

const HiddenNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const removedDefaultNavbarItems = useRemovedDefaultNavbarItems();
  const pages = usePages();
  const pageSlugById = usePageSlugById();
  const locale = useLocale();

  const notAllHooksRendered =
    isNilOrError(navbarItems) ||
    isNilOrError(removedDefaultNavbarItems) ||
    isNilOrError(pages) ||
    isNilOrError(pageSlugById) ||
    isNilOrError(locale);

  const itemsNotInNavbar = useMemo(() => {
    if (notAllHooksRendered) return null;

    return getItemsNotInNavbar(
      navbarItems,
      removedDefaultNavbarItems,
      pages.filter(removePolicyAndProposalsInfoPages)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navbarItems, removedDefaultNavbarItems, pages]);

  if (notAllHooksRendered || isNilOrError(itemsNotInNavbar)) {
    return null;
  }

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
      getNavbarItemSlug(
        item.type === 'default_item' ? item.navbarCode : 'custom',
        pageSlugById,
        item.type === 'page' ? item.pageId : undefined
      ) || '/';

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

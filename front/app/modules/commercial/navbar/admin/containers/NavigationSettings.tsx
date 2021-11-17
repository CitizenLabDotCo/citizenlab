import React, { useMemo, useState } from 'react';
import { Box } from 'cl2-component-library';

// services
import {
  addNavbarItem,
  updateNavbarItem,
  reorderNavbarItem,
  removeNavbarItem,
} from '../../services/navbar';
import { INavbarItem } from 'services/navbar';
import { deletePage, IPageData } from 'services/pages';
import { IRelationship } from 'typings';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import useLocale from 'hooks/useLocale';
import usePages from 'hooks/usePages';

// components
import VisibleNavbarItemList from '../components/NavbarItemList/VisibleNavbarItemList';
import HiddenNavbarItemList from '../components/NavbarItemList/HiddenNavbarItemList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getItemsNotInNavbar from './getItemsNotInNavbar';

const PageTitle = styled.div`
  font-size: 25px;
  font-weight: 700;
  color: ${colors.adminTextColor};
  margin-bottom: 28px;
`;

const PageSubtitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: ${colors.label};
  margin-bottom: 58px;
`;

const DEFAULT_PATHS = {
  home: '',
  projects: 'projects',
  all_input: 'ideas',
  proposals: 'initiatives',
  events: 'events',
};

const findSlug = (pages: IPageData[], pageRelation: IRelationship) => {
  return pages.find((page) => pageRelation.id === page.id)?.attributes.slug;
};

const NavigationSettings = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const locale = useLocale();
  const pages = usePages();

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

  const itemsNotInNavBar = useMemo(() => {
    return getItemsNotInNavbar(navbarItems, pages);
  }, [navbarItems, pages]);

  const handleAddNavbarItem = (pageId: string) => {
    // const page = pages.find(pageData => pageId === pageData.id)
    // addNavbarItem(id, {
    // })
  };

  const handleReorderNavbarItem = (id: string, ordering: number) => {
    reorderNavbarItem(id, { ordering });
  };

  const viewPage = (navbarItem: INavbarItem) => {
    const originWithLocale = `${window.location.origin}/${locale}`;
    const path =
      navbarItem.attributes.code === 'custom' &&
      navbarItem.relationships.page?.data
        ? `pages/${findSlug(pages, navbarItem.relationships.page.data)}`
        : DEFAULT_PATHS[navbarItem.attributes.code];

    window.open(`${originWithLocale}/${path}`, '_blank');
  };

  const createDeletePage = (message) => (pageId) => {
    if (window.confirm(formatMessage(message))) {
      deletePage(pageId);
    }
  };

  return (
    <>
      <PageTitle>
        <FormattedMessage {...messages.pageTitle} />
      </PageTitle>

      <PageSubtitle>
        <FormattedMessage {...messages.pageSubtitle} />
      </PageSubtitle>

      <Box mb="44px">
        <VisibleNavbarItemList
          navbarItems={navbarItems}
          lockFirstNItems={2}
          onClickRemoveButton={removeNavbarItem}
          onReorder={handleReorderNavbarItem}
          onClickDeleteButton={createDeletePage(
            messages.deletePageConfirmationVisible
          )}
          onClickViewButton={viewPage}
        />
      </Box>

      <HiddenNavbarItemList
        itemsNotInNavbar={itemsNotInNavBar}
        addButtonDisabled={navbarItems.length === 7}
        onClickAddButton={handleAddNavbarItem}
        onClickDeleteButton={createDeletePage(
          messages.deletePageConfirmationHidden
        )}
        onClickViewButton={viewPage}
      />
    </>
  );
};

export default injectIntl(NavigationSettings);

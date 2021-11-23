import React from 'react';

// services
import { reorderNavbarItem, removeNavbarItem } from '../../services/navbar';
import { deletePage } from 'services/pages';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// components
import {
  SortableList,
  SortableRow,
  LockedRow,
} from 'components/admin/ResourceList';
import NavbarItemRow from '../components/NavbarItemRow';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import useLocale from 'hooks/useLocale';
import usePages from 'hooks/usePages';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// typings
import { INavbarItem } from 'services/navbar';
import { IRelationship } from 'typings';
import { IPageData } from 'services/pages';

// utils
import { isNilOrError } from 'utils/helperUtils';

export const Title = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  margin-bottom: 20px;
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

const VisibleNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const locale = useLocale();
  const pages = usePages();

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

  const handleRemoveNavbarItem = (navbarItemId) => () => {
    removeNavbarItem(navbarItemId);
  };

  const handleDeletePage = (pageId) => () => {
    if (pageId === undefined) return;

    if (window.confirm(formatMessage(messages.deletePageConfirmationVisible))) {
      deletePage(pageId);
    }
  };

  const handleViewPage = (navbarItem: INavbarItem) => () => {
    const originWithLocale = `${window.location.origin}/${locale}`;
    const path =
      navbarItem.attributes.code === 'custom' &&
      navbarItem.relationships.page?.data
        ? `pages/${findSlug(pages, navbarItem.relationships.page.data)}`
        : DEFAULT_PATHS[navbarItem.attributes.code];

    window.open(`${originWithLocale}/${path}`, '_blank');
  };

  return (
    <>
      <Title>
        <FormattedMessage {...messages.navigationItems} />
      </Title>

      <SortableList
        items={navbarItems}
        onReorder={reorderNavbarItem}
        lockFirstNItems={2}
      >
        {({ lockedItemsList, itemsList, handleDragRow, handleDropRow }) => (
          <>
            {lockedItemsList.map((navbarItem: INavbarItem, i: number) => (
              <LockedRow
                key={navbarItem.id}
                isLastItem={i === itemsList.length - 1}
                data-testid="locked-row"
              >
                <NavbarItemRow
                  isDefaultPage={navbarItem.attributes.code !== 'custom'}
                  onClickViewButton={handleViewPage(navbarItem)}
                />
              </LockedRow>
            ))}

            {itemsList.map((navbarItem: INavbarItem, i: number) => (
              <SortableRow
                key={navbarItem.id}
                id={navbarItem.id}
                index={i}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
                isLastItem={i === itemsList.length - 1}
              >
                <NavbarItemRow
                  isDefaultPage={navbarItem.attributes.code !== 'custom'}
                  showRemoveButton
                  onClickRemoveButton={handleRemoveNavbarItem(navbarItem.id)}
                  onClickDeleteButton={handleDeletePage(
                    navbarItem.relationships.page?.data.id
                  )}
                  onClickViewButton={handleViewPage(navbarItem)}
                />
              </SortableRow>
            ))}
          </>
        )}
      </SortableList>
    </>
  );
};

export default injectIntl(VisibleNavbarItemList);

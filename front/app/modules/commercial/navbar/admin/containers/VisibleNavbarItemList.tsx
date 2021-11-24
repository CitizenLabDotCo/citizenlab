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
import {
  TNavbarItem,
  IDefaultNavbarItem,
  IPageNavbarItem,
} from 'services/navbar';
import { IPageData } from 'services/pages';

// utils
import { isNilOrError } from 'utils/helperUtils';

export const Title = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const DEFAULT_PAGE_SLUGS = {
  home: '',
  projects: '/projects',
  all_input: '/ideas',
  proposals: '/initiatives',
  events: '/events',
};

// const getDefaultPageSlug = ()

const getCustomPageSlug = (pages: IPageData[], pageId: string) => {
  const pageSlug = pages.find((page) => pageId === page.id)?.attributes.slug;
  return pageSlug || '';
};

function getPageId(navbarItem: IDefaultNavbarItem): undefined;
function getPageId(navbarItem: IPageNavbarItem): string;
function getPageId(navbarItem: any) {
  return navbarItem.relationships?.page?.data?.id;
}

const VisibleNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const locale = useLocale();
  const pages = usePages();

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

  const createViewPage = (navbarItem: TNavbarItem) => () => {
    const originWithLocale = `${window.location.origin}/${locale}`;

    const slug =
      navbarItem.attributes.code === 'custom'
        ? `/pages/${getCustomPageSlug(
            pages,
            navbarItem.relationships.page.data.id
          )}`
        : DEFAULT_PAGE_SLUGS[navbarItem.attributes.code];

    window.open(originWithLocale + slug, '_blank');
  };

  const createRemoveNavbarItem = (navbarItemId: string) => () => {
    removeNavbarItem(navbarItemId);
  };

  const createDeletePage = (pageId?: string) => () => {
    if (pageId === undefined) return;

    if (window.confirm(formatMessage(messages.deletePageConfirmationVisible))) {
      deletePage(pageId);
    }
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
            {lockedItemsList.map((navbarItem: TNavbarItem, i: number) => (
              <LockedRow
                key={navbarItem.id}
                isLastItem={i === itemsList.length - 1}
                data-testid="locked-row"
              >
                <NavbarItemRow
                  isDefaultPage={navbarItem.attributes.code !== 'custom'}
                  onClickViewButton={createViewPage(navbarItem)}
                />
              </LockedRow>
            ))}

            {itemsList.map((navbarItem: TNavbarItem, i: number) => (
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
                  onClickRemoveButton={createRemoveNavbarItem(navbarItem.id)}
                  onClickDeleteButton={createDeletePage(
                    navbarItem.attributes.code === 'custom'
                      ? navbarItem.relationships.page.data.id
                      : undefined
                  )}
                  onClickViewButton={createViewPage(navbarItem)}
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

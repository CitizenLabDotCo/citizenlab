import React from 'react';

// services
import {
  reorderNavbarItem,
  removeNavbarItem,
} from '../../../../services/navbar';
import { deletePage } from '../../../../services/pages';
import { INavbarItem, getNavbarItemSlug } from 'services/navbar';

// components
import {
  SortableList,
  SortableRow,
  LockedRow,
} from 'components/admin/ResourceList';
import { SubSectionTitle } from 'components/admin/Section';
import NavbarItemRow from '../../../components/NavbarItemRow';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import useLocale from 'hooks/useLocale';
import usePageSlugById from 'hooks/usePageSlugById';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { NAVIGATION_PATH } from '../..';

const VisibleNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const locale = useLocale();
  const pageSlugById = usePageSlugById();

  if (
    isNilOrError(navbarItems) ||
    isNilOrError(pageSlugById) ||
    isNilOrError(locale)
  ) {
    return null;
  }

  const handleClickEdit = (navbarItem: INavbarItem) => () => {
    const pageData = navbarItem.relationships.static_page.data;

    pageData
      ? clHistory.push(`${NAVIGATION_PATH}/pages/edit/${pageData.id}`)
      : clHistory.push(`${NAVIGATION_PATH}/navbar-items/edit/${navbarItem.id}`);
  };

  const handleClickView = (navbarItem: INavbarItem) => () => {
    const originWithLocale = `${window.location.origin}/${locale}`;
    const slug =
      getNavbarItemSlug(
        navbarItem.attributes.code,
        pageSlugById,
        navbarItem.relationships.static_page.data?.id
      ) || '/';

    window.open(originWithLocale + slug, '_blank');
  };

  const handleClickRemove = (navbarItemId: string) => () => {
    removeNavbarItem(navbarItemId);
  };

  const handleClickDelete = (pageId?: string) => () => {
    if (pageId === undefined) return;

    if (window.confirm(formatMessage(messages.deletePageConfirmationVisible))) {
      deletePage(pageId);
    }
  };

  return (
    <>
      <SubSectionTitle>
        <FormattedMessage {...messages.navigationItems} />
      </SubSectionTitle>

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
                  title={navbarItem.attributes.title_multiloc}
                  isDefaultPage={navbarItem.attributes.code !== 'custom'}
                  showEditButton={navbarItem.attributes.code !== 'home'}
                  onClickEditButton={handleClickEdit(navbarItem)}
                  onClickViewButton={handleClickView(navbarItem)}
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
                  title={navbarItem.attributes.title_multiloc}
                  isDefaultPage={navbarItem.attributes.code !== 'custom'}
                  showEditButton
                  showRemoveButton
                  onClickEditButton={handleClickEdit(navbarItem)}
                  onClickRemoveButton={handleClickRemove(navbarItem.id)}
                  onClickDeleteButton={handleClickDelete(
                    navbarItem.relationships.static_page.data?.id
                  )}
                  onClickViewButton={handleClickView(navbarItem)}
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

import React from 'react';

// services
import { getNavbarItemSlug, INavbarItem } from 'services/navbar';
import { deletePage } from 'services/pages';
import {
  removeNavbarItem,
  reorderNavbarItem,
} from '../../../../services/navbar';

// components
import {
  LockedRow,
  SortableList,
  SortableRow,
} from 'components/admin/ResourceList';
import { SubSectionTitle } from 'components/admin/Section';
import NavbarItemRow from 'containers/Admin/pagesAndMenu/containers/NavigationSettings/NavbarItemRow';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useNavbarItems from 'hooks/useNavbarItems';
import usePageSlugById from 'hooks/usePageSlugById';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

const VisibleNavbarItemList = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const navbarItems = useNavbarItems();
  const pageSlugById = usePageSlugById();
  const previewNewCustomPages = useFeatureFlag({
    name: 'preview_new_custom_pages',
  });

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) {
    return null;
  }

  const handleClickEdit = (navbarItem: INavbarItem) => () => {
    // redirect to homepage toggle page
    if (navbarItem?.attributes?.code && navbarItem.attributes.code === 'home') {
      clHistory.push(`${PAGES_MENU_PATH}/homepage/`);
      return;
    }

    const pageData = navbarItem.relationships.static_page.data;

    pageData
      ? previewNewCustomPages
        ? clHistory.push(`${PAGES_MENU_PATH}/custom/${pageData.id}`)
        : clHistory.push(`${PAGES_MENU_PATH}/pages/edit/${pageData.id}`)
      : clHistory.push(`${PAGES_MENU_PATH}/navbar-items/edit/${navbarItem.id}`);
  };

  const getViewButtonLink = (navbarItem: INavbarItem) => {
    return (
      getNavbarItemSlug(
        navbarItem.attributes.code,
        pageSlugById,
        navbarItem.relationships.static_page.data?.id
      ) || '/'
    );
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
            {lockedItemsList?.map((navbarItem: INavbarItem, i: number) => (
              <LockedRow
                key={navbarItem.id}
                isLastItem={i === itemsList.length - 1}
                data-testid="locked-row"
              >
                <NavbarItemRow
                  title={navbarItem.attributes.title_multiloc}
                  isDefaultPage={navbarItem.attributes.code !== 'custom'}
                  showEditButton
                  viewButtonLink={getViewButtonLink(navbarItem)}
                  onClickEditButton={handleClickEdit(navbarItem)}
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
                  viewButtonLink={getViewButtonLink(navbarItem)}
                  onClickEditButton={handleClickEdit(navbarItem)}
                  onClickRemoveButton={handleClickRemove(navbarItem.id)}
                  onClickDeleteButton={handleClickDelete(
                    navbarItem.relationships.static_page.data?.id
                  )}
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

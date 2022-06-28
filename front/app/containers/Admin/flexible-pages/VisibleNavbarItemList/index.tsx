import React from 'react';

// services
import {
  reorderNavbarItem,
  removeNavbarItem,
} from 'modules/commercial/customizable_navbar/services/navbar';
import { deletePage } from 'services/pages';
import { INavbarItem, getNavbarItemSlug } from 'services/navbar';
import { adminPagesMenuPagesEditHomePath } from 'modules/commercial/customizable_navbar/services/pathUtils';

// components
import {
  SortableList,
  SortableRow,
  LockedRow,
} from 'components/admin/ResourceList';
import { SubSectionTitle } from 'components/admin/Section';
import NavbarItemRow from 'containers/Admin/flexible-pages/NavbarItemRow';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePageSlugById from 'hooks/usePageSlugById';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { NAVIGATION_PATH } from 'containers/Admin/flexible-pages';
import useFeatureFlag from 'hooks/useFeatureFlag';

const VisibleNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems({ standard: true });
  const pageSlugById = usePageSlugById();
  const customizableNavbarEnabled = useFeatureFlag({
    name: 'customizable_navbar',
  });

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) {
    return null;
  }

  const handleClickEdit = (navbarItem: INavbarItem) => () => {
    const pageData = navbarItem.relationships.static_page.data;

    if (navbarItem.attributes.code === 'home') {
      clHistory.push(adminPagesMenuPagesEditHomePath());
    } else {
      pageData
        ? clHistory.push(`${NAVIGATION_PATH}/pages/edit/${pageData.id}`)
        : clHistory.push(
            `${NAVIGATION_PATH}/navbar-items/edit/${navbarItem.id}`
          );
    }
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
      {customizableNavbarEnabled && (
        <SubSectionTitle>
          <FormattedMessage {...messages.navigationItems} />
        </SubSectionTitle>
      )}

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
                  showRemoveButton={customizableNavbarEnabled}
                  showDeleteButton={customizableNavbarEnabled}
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

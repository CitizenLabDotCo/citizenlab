import React from 'react';

// services
import {
  reorderNavbarItem,
  removeNavbarItem,
} from '../../../../services/navbar';
import { deletePage } from 'services/pages';
import { INavbarItem } from 'services/navbar';

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

import {
  getViewButtonLink,
  handleClickEdit,
} from 'containers/Admin/flexible-pages/NavbarItemRow/helpers';

const VisibleNavbarItemList = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const navbarItems = useNavbarItems();
  const pageSlugById = usePageSlugById();

  if (isNilOrError(navbarItems) || isNilOrError(pageSlugById)) {
    return null;
  }

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
                  viewButtonLink={getViewButtonLink(navbarItem, pageSlugById)}
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
                  viewButtonLink={getViewButtonLink(navbarItem, pageSlugById)}
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

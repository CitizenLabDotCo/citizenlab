import React from 'react';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// components
import {
  SortableList,
  SortableRow,
  LockedRow,
} from 'components/admin/ResourceList';
import NavbarItemRow from './NavbarItemRow';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { INavbarItem } from 'services/navbar';

interface Props {
  navbarItems: INavbarItem[];
  lockFirstNItems: number;
  onClickRemoveButton?: (id: string) => void;
  onReorder?: (id: string, ordering: number) => void;
}

export const Title = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const DEFAULT_ITEMS = new Set<string>([
  'home',
  'projects',
  'all_input',
  'proposals',
  'events',
]);

export default ({
  navbarItems,
  lockFirstNItems,
  onClickRemoveButton,
  onReorder,
}: Props) => (
  <>
    <Title>
      <FormattedMessage {...messages.navigationItems} />
    </Title>

    <SortableList
      items={navbarItems}
      onReorder={onReorder}
      lockFirstNItems={lockFirstNItems}
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
                navbarItem={navbarItem}
                isDefaultPage={DEFAULT_ITEMS.has(navbarItem.attributes.type)}
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
                navbarItem={navbarItem}
                isDefaultPage={DEFAULT_ITEMS.has(navbarItem.attributes.type)}
                showRemoveButton
                onClickRemoveButton={onClickRemoveButton}
              />
            </SortableRow>
          ))}
        </>
      )}
    </SortableList>
  </>
);

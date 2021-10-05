import React from 'react';

// components
import SortablePageList from './SortablePageList';
import UnsortablePageList from './UnsortablePageList';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { INavbarItem } from 'services/navbar';

const Title = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export interface ChildProps {
  navbarItems: INavbarItem[];
  getDisplaySettings: (navbarItem: INavbarItem) => IDisplaySettings;
  lockFirstNItems?: number;
  onClickAddButton?: (id: string) => void;
  onClickHideButton?: (id: string) => void;
}

export interface IDisplaySettings {
  isDefaultPage?: boolean;
  hasAddButton?: boolean;
  hasHideButton?: boolean;
}

interface Props extends ChildProps {
  title: string | JSX.Element;
  sortable?: boolean;
  className?: string;
}

export default ({
  title,
  navbarItems,
  getDisplaySettings,
  sortable,
  lockFirstNItems,
  className,
  onClickAddButton,
  onClickHideButton,
}: Props) => {
  return (
    <div className={className ?? ''}>
      <Title>{title}</Title>

      {sortable && (
        <SortablePageList
          navbarItems={navbarItems}
          getDisplaySettings={getDisplaySettings}
          lockFirstNItems={lockFirstNItems}
          onClickAddButton={onClickAddButton}
          onClickHideButton={onClickHideButton}
        />
      )}

      {!sortable && (
        <UnsortablePageList
          navbarItems={navbarItems}
          getDisplaySettings={getDisplaySettings}
          lockFirstNItems={lockFirstNItems}
          onClickAddButton={onClickAddButton}
          onClickHideButton={onClickHideButton}
        />
      )}
    </div>
  );
};

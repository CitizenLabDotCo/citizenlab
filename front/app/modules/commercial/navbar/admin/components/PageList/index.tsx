import React from 'react';

// components
import SortablePageList from './SortablePageList';
import UnsortablePageList from './UnsortablePageList';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { IPageData } from 'services/pages';

const Title = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export interface ChildProps {
  pages: IPageData[];
  pagesPermissions: IPagePermissions[];
  lockFirstNItems?: number;
  onClickAddButton?: (id: string) => void;
  onClickHideButton?: (id: string) => void;
}

export interface IPagePermissions {
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
  pages,
  pagesPermissions,
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
          pages={pages}
          pagesPermissions={pagesPermissions}
          lockFirstNItems={lockFirstNItems}
          onClickAddButton={onClickAddButton}
          onClickHideButton={onClickHideButton}
        />
      )}

      {!sortable && (
        <UnsortablePageList
          pages={pages}
          pagesPermissions={pagesPermissions}
          lockFirstNItems={lockFirstNItems}
          onClickAddButton={onClickAddButton}
          onClickHideButton={onClickHideButton}
        />
      )}
    </div>
  );
};

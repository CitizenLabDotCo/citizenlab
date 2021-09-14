import React from 'react';

// components
import SortablePageList from './SortablePageList';
import UnsortablePageList from './UnsortablePageList';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { IPageData } from 'services/pages';
import { IPagePermissions } from './PageRow';

const Title = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export interface ChildProps {
  pagesData: IPageData[];
  pagesPermissions: IPagePermissions[];
}

interface Props extends ChildProps {
  title: JSX.Element;
  sortable?: boolean;
  className?: string;
}

export default ({
  title,
  pagesData,
  pagesPermissions,
  sortable,
  className
}: Props) => {
  return (
    <div className={className ?? ''}>
      <Title>{title}</Title>

      {sortable && (
        <SortablePageList
          pagesData={pagesData}
          pagesPermissions={pagesPermissions}
        />
      )}

      {!sortable && (
        <UnsortablePageList
          pagesData={pagesData}
          pagesPermissions={pagesPermissions}
        />
      )}
    </div>
  );
};

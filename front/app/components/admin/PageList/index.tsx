import React from 'react';

// components
import { List } from 'components/admin/ResourceList';
import PageRow, { IPagePermissions } from './PageRow';

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

interface Props {
  title: JSX.Element;
  pagesData: IPageData[];
  pagesPermissions: IPagePermissions[];
  className?: string;
}

export default ({ title, pagesData, pagesPermissions, className }: Props) => {
  return (
    <div className={className ?? ''}>
      <Title>{title}</Title>

      <List key={pagesData.length}>
        {pagesData.map((pageData, i) => (
          <PageRow
            key={pageData.id}
            pageData={pageData}
            pagePermissions={pagesPermissions[i]}
          />
        ))}
      </List>
    </div>
  );
};
import React from 'react';

// components
import { List } from 'components/admin/ResourceList';
import PageRow from './PageRow';

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
  pages: IPageData[];
  className?: string;
}

export default ({ title, pages, className }: Props) => {
  return (
    <div className={className ?? ''}>
      <Title>{title}</Title>

      <List key={pages.length}>
        {pages
          .filter((page) => {
            // These pages are only changeable in Crowdin.
            // Changing them here wouldn't have any effect.
            // So to avoid confusion, they're not shown.
            return (
              page.attributes.slug !== 'homepage_info' &&
              page.attributes.slug !== 'cookie-policy' &&
              page.attributes.slug !== 'accessibility-statement'
            );
          })
          .map((page) => (
            <PageRow key={page.id} page={page} />
          ))}
      </List>
    </div>
  );
};

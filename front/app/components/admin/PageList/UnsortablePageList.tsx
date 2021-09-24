import React from 'react';
import { List, Row, LockedRow } from 'components/admin/ResourceList';
import { ChildProps as Props } from '.';
import PageRow from './PageRow';

export default ({
  pages,
  pagesPermissions,
  lockFirstNItems,
  onClickAddButton,
}: Props) => (
  <List key={pages.length}>
    {pages.map((pageData, i) => {
      if (lockFirstNItems && i < lockFirstNItems) {
        return (
          <LockedRow isLastItem={i === pages.length - 1} key={pageData.id}>
            <PageRow
              pageData={pageData}
              pagePermissions={pagesPermissions[i]}
              onClickAddButton={onClickAddButton}
            />
          </LockedRow>
        );
      } else {
        return (
          <Row
            id={pageData.id}
            key={pageData.id}
            isLastItem={i === pages.length - 1}
          >
            <PageRow
              pageData={pageData}
              pagePermissions={pagesPermissions[i]}
              onClickAddButton={onClickAddButton}
            />
          </Row>
        );
      }
    })}
  </List>
);

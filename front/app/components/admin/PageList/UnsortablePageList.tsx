import React from 'react';
import { List, Row, LockedRow } from 'components/admin/ResourceList';
import { ChildProps as Props } from '.';
import PageRow from './PageRow';

export default ({ pagesData, pagesPermissions, lockFirstNItems }: Props) => (
  <List key={pagesData.length}>
    {pagesData.map((pageData, i) => (
      <>
        {lockFirstNItems && i < lockFirstNItems && (
          <LockedRow isLastItem={i === pagesData.length - 1} key={pageData.id}>
            <PageRow
              pageData={pageData}
              pagePermissions={pagesPermissions[i]}
            />
          </LockedRow>
        )}

        {(!lockFirstNItems || i >= lockFirstNItems) && (
          <Row
            id={pageData.id}
            key={pageData.id}
            isLastItem={i === pagesData.length - 1}
          >
            <PageRow
              pageData={pageData}
              pagePermissions={pagesPermissions[i]}
            />
          </Row>
        )}
      </>
    ))}
  </List>
);

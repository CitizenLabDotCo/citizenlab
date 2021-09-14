import React from 'react';
import { List, Row } from 'components/admin/ResourceList';
import { ChildProps as Props } from '.'
import PageRow from './PageRow'

export default ({
  pagesData,
  pagesPermissions
}: Props) => (
  <List key={pagesData.length}>
    {pagesData.map((pageData, i) => (
      <Row id={pageData.id} key={pageData.id}>
        <PageRow
          pageData={pageData}
          pagePermissions={pagesPermissions[i]}
        />
      </Row>
    ))}
  </List>
);
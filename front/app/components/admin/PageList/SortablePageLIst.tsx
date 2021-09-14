import React from 'react';
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import { ChildProps as Props } from '.'
import PageRow from './PageRow'

export default ({
  pagesData,
  pagesPermissions
}: Props) => (
  <SortableList>
    {({ itemsList, handleDragRow, handleDropRow }) => {
      return (
        <>
          {itemsList.map((item, i: number) => {
            return (
              <SortableRow
                key={item.id}
                id={item.id}
                index={i}
                moveRow={handleDragRow}
                dropRow={handleDropRow}
                lastItem={
                  i === itemsList.length - 1
                }
              >
                <PageRow
                  pageData={item}
                  pagePermissions={pagesPermissions[i]}
                />
              </SortableRow>
            );
          }
          )}
        </>
      );
    }}
  </SortableList>
)
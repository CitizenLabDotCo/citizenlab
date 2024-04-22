import React, { Fragment } from 'react';

import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useReorderAdminPublication from 'api/admin_publications/useReorderAdminPublication';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

import ProjectRow from '../../components/ProjectRow';

import SortableFolderRow from './SortableFolderRow';

const StyledSortableRow = styled(SortableRow)`
  & .sortablerow-draghandle {
    align-self: flex-start;
  }
`;

const SortableProjectList = ({
  adminPublications,
}: {
  adminPublications: IAdminPublicationData[] | undefined;
}) => {
  const { mutate: reorderAdminPublication } = useReorderAdminPublication();

  function handleReorderAdminPublication(itemId: string, newOrder: number) {
    reorderAdminPublication({ id: itemId, ordering: newOrder });
  }

  if (adminPublications && adminPublications?.length > 0) {
    return (
      <SortableList
        items={adminPublications}
        onReorder={handleReorderAdminPublication}
        className="projects-list e2e-admin-projects-list"
        id="e2e-admin-projects-list-unsortable"
        key={adminPublications.length}
      >
        {({ itemsList, handleDragRow, handleDropRow }) => {
          return (
            <>
              {itemsList.map((item: IAdminPublicationData, index: number) => {
                return (
                  <Fragment key={item.id}>
                    {item.relationships.publication.data.type === 'project' && (
                      <StyledSortableRow
                        id={item.id}
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        isLastItem={index === adminPublications.length - 1}
                      >
                        <ProjectRow actions={['manage']} publication={item} />
                      </StyledSortableRow>
                    )}
                    {item.relationships.publication.data.type === 'folder' && (
                      <SortableFolderRow
                        id={item.id}
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        isLastItem={index === adminPublications.length - 1}
                        publication={item}
                      />
                    )}
                  </Fragment>
                );
              })}
            </>
          );
        }}
      </SortableList>
    );
  }

  return null;
};

export default SortableProjectList;

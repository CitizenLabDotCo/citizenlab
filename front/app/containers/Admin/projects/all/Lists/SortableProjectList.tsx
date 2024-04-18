import React, { Fragment } from 'react';

import { InfiniteData } from '@tanstack/react-query';
import styled from 'styled-components';

import {
  IAdminPublicationData,
  IAdminPublications,
} from 'api/admin_publications/types';
import useReorderAdminPublication from 'api/admin_publications/useReorderAdminPublication';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SortableList, SortableRow } from 'components/admin/ResourceList';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import ProjectRow from '../../components/ProjectRow';
import messages from '../messages';
import { ListHeader, HeaderTitle } from '../StyledComponents';

import SortableFolderRow from './SortableFolderRow';

const StyledSortableRow = styled(SortableRow)`
  & .sortablerow-draghandle {
    align-self: flex-start;
  }
`;

const StyledListHeader = styled(ListHeader)`
  margin-bottom: 30px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const SortableProjectList = ({
  adminPublications,
}: {
  adminPublications: InfiniteData<IAdminPublications> | undefined;
}) => {
  const { mutate: reorderAdminPublication } = useReorderAdminPublication();

  const rootLevelAdminPublications = adminPublications?.pages
    .map((page) => page.data)
    .flat();

  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

  function handleReorderAdminPublication(itemId: string, newOrder: number) {
    reorderAdminPublication({ id: itemId, ordering: newOrder });
  }

  if (
    !isNilOrError(rootLevelAdminPublications) &&
    rootLevelAdminPublications.length > 0
  ) {
    return (
      <>
        <StyledListHeader>
          <HeaderTitle>
            <FormattedMessage
              {...(isProjectFoldersEnabled
                ? messages.projectsAndFolders
                : messages.existingProjects)}
            />
          </HeaderTitle>
          <Spacer />
        </StyledListHeader>
        <SortableList
          items={rootLevelAdminPublications}
          onReorder={handleReorderAdminPublication}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-projects-list-unsortable"
          key={rootLevelAdminPublications.length}
        >
          {({ itemsList, handleDragRow, handleDropRow }) => {
            return (
              <>
                {itemsList.map((item: IAdminPublicationData, index: number) => {
                  return (
                    <Fragment key={item.id}>
                      {item.relationships.publication.data.type ===
                        'project' && (
                        <StyledSortableRow
                          id={item.id}
                          index={index}
                          moveRow={handleDragRow}
                          dropRow={handleDropRow}
                          isLastItem={
                            index === rootLevelAdminPublications.length - 1
                          }
                        >
                          <ProjectRow actions={['manage']} publication={item} />
                        </StyledSortableRow>
                      )}
                      {item.relationships.publication.data.type ===
                        'folder' && (
                        <SortableFolderRow
                          id={item.id}
                          index={index}
                          moveRow={handleDragRow}
                          dropRow={handleDropRow}
                          isLastItem={
                            index === rootLevelAdminPublications.length - 1
                          }
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
      </>
    );
  }

  return null;
};

export default SortableProjectList;

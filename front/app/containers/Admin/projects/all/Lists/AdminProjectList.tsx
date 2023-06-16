import React, { Fragment, memo } from 'react';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import ProjectRow from '../../components/ProjectRow';
import { ListHeader, HeaderTitle } from '../StyledComponents';
import Button from 'components/UI/Button';
import SortableFolderRow from './SortableFolderRow';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { IAdminPublicationData } from 'api/admin_publications/types';
import useReorderAdminPublication from 'api/admin_publications/useReorderAdminPublication';

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

interface Props {}

const AdminProjectList = memo<Props>((_props) => {
  const { mutate: reorderAdminPublication } = useReorderAdminPublication();
  const { data } = useAdminPublications({
    publicationStatusFilter: ['published', 'draft', 'archived'],
    rootLevelOnly: true,
  });

  const rootLevelAdminPublications = data?.pages
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
          {isProjectFoldersEnabled && (
            <Button
              data-cy="e2e-new-project-folder-button"
              linkTo={'/admin/projects/folders/new'}
              buttonStyle="admin-dark"
            >
              <FormattedMessage {...messages.newProjectFolder} />
            </Button>
          )}
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
});

export default AdminProjectList;

import React, { memo } from 'react';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import ProjectRow from '../../components/ProjectRow';
import ProjectFolderRow from '../../projectFolders/components/ProjectFolderRow';
import { ListHeader, HeaderTitle } from '../StyledComponents';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { reorderAdminPublication } from 'services/adminPublications';
import useAdminPublications, {
  IAdminPublicationContent,
} from 'hooks/useAdminPublications';
import useFeatureFlag from 'hooks/useFeatureFlag';

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

function handleReorderAdminPublication(itemId, newOrder) {
  reorderAdminPublication(itemId, newOrder);
}

const AdminProjectList = memo<Props>((_props) => {
  const { list: rootLevelAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'archived', 'draft'],
    rootLevelOnly: true,
  });
  const isProjectFoldersEnabled = useFeatureFlag({ name: 'project_folders' });

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
                {itemsList.map(
                  (item: IAdminPublicationContent, index: number) => {
                    return (
                      <StyledSortableRow
                        key={item.id}
                        id={item.id}
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        isLastItem={
                          index === rootLevelAdminPublications.length - 1
                        }
                      >
                        {item.publicationType === 'project' && (
                          <ProjectRow
                            actions={['delete', 'manage']}
                            publication={item}
                          />
                        )}
                        {item.publicationType === 'folder' && (
                          <ProjectFolderRow publication={item} />
                        )}
                      </StyledSortableRow>
                    );
                  }
                )}
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

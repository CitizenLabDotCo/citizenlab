import React, { memo } from 'react';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import ProjectRow from '../../components/ProjectRow';
import Outlet from 'components/Outlet';
import { ListHeader, HeaderTitle } from '../StyledComponents';

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
  const { topLevel: topLevelAdminPublications } = useAdminPublications({
    publicationStatusFilter: ['published', 'archived', 'draft'],
  });
  const isProjectFoldersEnabled = useFeatureFlag('project_folders');

  if (
    !isNilOrError(topLevelAdminPublications) &&
    topLevelAdminPublications.length > 0
  ) {
    return (
      <>
        <StyledListHeader>
          <HeaderTitle>
            {!isProjectFoldersEnabled && (
              <FormattedMessage {...messages.existingProjects} />
            )}
            <Outlet id="app.containers.AdminPage.projects.all.projectsAndFolders.title" />
          </HeaderTitle>
          <Spacer />
          <Outlet id="app.containers.AdminPage.projects.all.projectsAndFolders.actions" />
        </StyledListHeader>
        <SortableList
          items={topLevelAdminPublications}
          onReorder={handleReorderAdminPublication}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-published-projects-list"
          key={topLevelAdminPublications.length}
        >
          {({ itemsList, handleDragRow, handleDropRow }) => {
            return (
              <>
                {itemsList.map(
                  (item: IAdminPublicationContent, index: number) => {
                    return (
                      <>
                        <StyledSortableRow
                          key={item.id}
                          id={item.id}
                          index={index}
                          moveRow={handleDragRow}
                          dropRow={handleDropRow}
                          lastItem={
                            index === topLevelAdminPublications.length - 1
                          }
                        >
                          {item.publicationType === 'project' && (
                            <ProjectRow
                              actions={['delete', 'manage']}
                              publication={item}
                            />
                          )}
                          <Outlet
                            id="app.containers.AdminPage.projects.all.projectsAndFolders.row"
                            publication={item}
                          />
                        </StyledSortableRow>
                      </>
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

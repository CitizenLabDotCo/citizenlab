import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetAdminPublications, {
  GetAdminPublicationsChildProps,
} from 'resources/GetAdminPublications';

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
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import useFeatureFlag from 'hooks/useFeatureFlag';

const StyledListHeader = styled(ListHeader)`
  margin-bottom: 30px;
`;

const Spacer = styled.div`
  flex: 1;
`;

interface DataProps {
  AdminPublications: GetAdminPublicationsChildProps;
}

interface Props extends DataProps {}

function handleReorderAdminPublication(itemId, newOrder) {
  reorderAdminPublication(itemId, newOrder);
}

const AdminProjectList = memo<Props>(({ AdminPublications }) => {
  const AdminPublicationsList = AdminPublications.list;
  const isProjectFoldersEnabled = useFeatureFlag('project_folders');

  if (
    !isNilOrError(AdminPublicationsList) &&
    AdminPublicationsList.length > 0
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
          items={AdminPublicationsList}
          onReorder={handleReorderAdminPublication}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-published-projects-list"
          key={AdminPublicationsList.length}
        >
          {({ itemsList, handleDragRow, handleDropRow }) => {
            return (
              <>
                {itemsList.map(
                  (item: IAdminPublicationContent, index: number) => {
                    return (
                      <>
                        <SortableRow
                          key={item.id}
                          id={item.id}
                          index={index}
                          moveRow={handleDragRow}
                          dropRow={handleDropRow}
                          lastItem={index === AdminPublicationsList.length - 1}
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
                        </SortableRow>
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

const Data = adopt<DataProps>({
  AdminPublications: (
    <GetAdminPublications
      publicationStatusFilter={['published', 'archived', 'draft']}
      folderId={null}
    />
  ),
});

export default () => (
  <Data>{(dataProps) => <AdminProjectList {...dataProps} />}</Data>
);

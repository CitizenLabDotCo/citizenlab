import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetAdminPublications, { GetAdminPublicationsChildProps } from 'resources/GetAdminPublications';

// components
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import ProjectRow from '../../components/ProjectRow';
import FolderRow from '../../components/FolderRow';
import Button from 'components/UI/Button';
import { ListHeader, HeaderTitle } from '../StyledComponents';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { reorderAdminPublication } from 'services/adminPublications';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import GetFeatureFlag from 'resources/GetFeatureFlag';

const StyledListHeader = styled(ListHeader)`
  margin-bottom: 30px;
`;

const Spacer = styled.div`
  flex: 1;
`;

interface DataProps {
  AdminPublications: GetAdminPublicationsChildProps;
  foldersEnabled: boolean;
}

interface Props extends DataProps { }

function handleReorderAdminPublication(itemId, newOrder) {
  reorderAdminPublication(itemId, newOrder);
}

const AdminProjectList = memo<Props>(({ AdminPublications, foldersEnabled }) => {
  const AdminPublicationsList = AdminPublications.list;

  if (!isNilOrError(AdminPublicationsList) && AdminPublicationsList.length > 0) {
    return (
      <>
        <StyledListHeader>
          <HeaderTitle>
            {foldersEnabled
              ? <FormattedMessage {...messages.projectsAndFolders} />
              : <FormattedMessage {...messages.existingProjects} />
            }
          </HeaderTitle>
          {foldersEnabled &&
            <>
              <Spacer />
              <Button
                linkTo={'/admin/projects/folders/new'}
                buttonStyle="admin-dark"
              >
                <FormattedMessage {...messages.newProjectFolder} />
              </Button>
            </>
          }
        </StyledListHeader>
        <SortableList
          items={AdminPublicationsList}
          onReorder={handleReorderAdminPublication}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-published-projects-list"
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            itemsList.map((item: IAdminPublicationContent, index: number) => {
              return (
                <SortableRow
                  key={item.id}
                  id={item.id}
                  index={index}
                  moveRow={handleDragRow}
                  dropRow={handleDropRow}
                  lastItem={(index === AdminPublicationsList.length - 1)}
                >
                  {item.publicationType === 'project'
                    ? <ProjectRow publication={item} />
                    : <FolderRow publication={item} />}
                </SortableRow>
              );
            }
            ))}
        </SortableList>
      </>
    );
  }

  return null;
});

const Data = adopt<DataProps>({
  AdminPublications: <GetAdminPublications publicationStatusFilter={['published', 'archived', 'draft']} folderId={null}/>,
  foldersEnabled: <GetFeatureFlag name="project_folders" />
});

export default () => (
  <Data>
    {dataProps => <AdminProjectList {...dataProps} />}
  </Data>
);

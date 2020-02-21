import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// style
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetProjectHolderOrderings, { GetProjectHolderOrderingsChildProps } from 'resources/GetProjectHolderOrderings';

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
import { reorderProjectHolder } from 'services/projectHolderOrderings';
import { IProjectHolderOrderingContent } from 'hooks/useProjectHolderOrderings';
import FeatureFlag from 'components/FeatureFlag';

const StyledListHeader = styled(ListHeader)`
  margin-bottom: 30px;
`;

const Spacer = styled.div`
  flex: 1;
`;

interface DataProps {
  projectHolderOrderings: GetProjectHolderOrderingsChildProps;
}

interface Props extends DataProps { }

function handleReorderHolders(itemId, newOrder) {
  reorderProjectHolder(itemId, newOrder);
}

const AdminProjectList = memo<Props>(({ projectHolderOrderings }) => {
  const projectHolderOrderingsList = projectHolderOrderings.list;

  if (!isNilOrError(projectHolderOrderingsList) && projectHolderOrderingsList.length > 0) {
    return (
      <>
        <StyledListHeader>
          <HeaderTitle>
            <FormattedMessage {...messages.projectsAndFolders} />
          </HeaderTitle>
          <FeatureFlag name="project_folders">
            <Spacer />
            <Button
              linkTo={'/admin/projects/folders/new'}
              buttonStyle="admin-dark"
            >
              <FormattedMessage {...messages.newProjectFolder} />
            </Button>
          </FeatureFlag>
        </StyledListHeader>

        <SortableList
          items={projectHolderOrderingsList}
          onReorder={handleReorderHolders}
          className="projects-list e2e-admin-projects-list"
          id="e2e-admin-published-projects-list"
        >
          {({ itemsList, handleDragRow, handleDropRow }) => (
            itemsList.map((item: IProjectHolderOrderingContent, index: number) => {
                return (
                  <SortableRow
                    key={item.id}
                    id={item.id}
                    index={index}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    lastItem={(index === projectHolderOrderingsList.length - 1)}
                  >
                    {item.projectHolderType === 'project'
                    ? <ProjectRow project={item.projectHolder} />
                    : <FolderRow folder={item.projectHolder} />}
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
  projectHolderOrderings: <GetProjectHolderOrderings publicationStatusFilter={['archived', 'published', 'draft']} />,
});

export default () => (
  <Data>
    {dataProps => <AdminProjectList {...dataProps} />}
  </Data>
);

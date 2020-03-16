import React, { memo, useState } from 'react';

// components
import Icon from 'components/UI/Icon';
import { RowContent, RowContentInner, RowTitle, RowButton, ActionsRowContainer } from './StyledComponents';

// styles
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// types & services
import { IProjectFolderData } from 'services/projectFolders';
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { adopt } from 'react-adopt';
import ProjectRow from './ProjectRow';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';

const FolderIcon = styled(Icon)`
  margin-right: 10px;
  height: 14px;
  width: 17px;
`;

const ArrowIcon = styled(Icon) <({ expanded: boolean }) >`
  flex: 0 0 11px;
  height: 11px;
  width: 11px;
  margin-right: 8px;
  transition: transform 350ms cubic-bezier(0.165, 0.84, 0.44, 1), fill 80ms ease-out;

  ${({ expanded }) => expanded && `
    transform: rotate(90deg);
  `}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FolderRowContent = styled(RowContent) <({ expanded: boolean, hasProjects: boolean }) >`
  ${({ expanded }) => expanded && `
    padding-bottom: 10px;
  `}
  ${({ hasProjects }) => hasProjects && `
    cursor: pointer;
  `}
`;

const ProjectRows = styled.div`
  margin-left: 30px;
`;

const InFolderProjectRow = styled(ProjectRow)`
  padding-bottom: 10px;
  padding-top: 10px;
  border-top: 1px solid ${colors.separation};

  &:last-child {
    padding-bottom: 0;
  }
`;

interface InputProps {
  folder: IProjectFolderData;
}

interface DataProps {
  projects: GetProjectsChildProps;
}

interface Props extends InputProps, DataProps { }

const FolderRow = memo<Props>(({ folder, projects }) => {
  const hasProjects = !isNilOrError(projects) && !!projects.projectsList ?.length && projects.projectsList.length > 0;
  const [folderOpen, setFolderOpen] = useState(false);
  const toggleExpand = () => setFolderOpen(folderOpen => !folderOpen);

  return (
    <Container>
      <FolderRowContent
        className="e2e-admin-projects-list-item"
        expanded={hasProjects && folderOpen}
        hasProjects={hasProjects}
        role="button"
        onClick={toggleExpand}
      >
        <RowContentInner className="expand primary">
          {hasProjects && <ArrowIcon expanded={hasProjects && folderOpen} name="chevron-right" />}
          <FolderIcon name="simpleFolder" />
          <RowTitle value={folder.attributes.title_multiloc} />
        </RowContentInner>
        <ActionsRowContainer>
          <RowButton
            className={`e2e-admin-edit-project ${folder.attributes.title_multiloc['en-GB'] || ''}`}
            linkTo={`/admin/projects/folders/${folder.id}`}
            buttonStyle="secondary"
            icon="edit"
          >
            <FormattedMessage {...messages.manageButtonLabel} />
          </RowButton>
        </ActionsRowContainer>
      </FolderRowContent>

      {hasProjects && folderOpen &&
        <ProjectRows>
          {projects ?.projectsList ?.map(project =>
            <InFolderProjectRow project={project} key={project.id} />
          )}
        </ProjectRows>
      }
    </Container>
  );
});

const Data = adopt<DataProps, InputProps>({
  projects: ({ folder: { id }, render }) => <GetProjects folderId={id} publicationStatuses={['draft', 'published', 'archived']}>{render}</GetProjects>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataprops => <FolderRow {...inputProps} {...dataprops} />}
  </Data>
);

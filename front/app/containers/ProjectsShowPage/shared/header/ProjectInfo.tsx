import React from 'react';

import {
  Title,
  Box,
  useBreakpoint,
  media,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectFiles from 'api/project_files/useProjectFiles';
import useProjectById from 'api/projects/useProjectById';

import Fragment from 'components/Fragment';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import ReadMoreWrapper from 'components/ReadMoreWrapper/ReadMoreWrapper';
import T from 'components/T';
import FileAttachments from 'components/UI/FileAttachments';

import ProjectInfoSideBar from './ProjectInfoSideBar';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.tablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  `}
`;

const Left = styled.div`
  flex: 1;

  ${media.tablet`
    margin-bottom: 20px;
  `}
`;

const Right = styled.div`
  flex: 0 0 310px;
  width: 310px;
  margin-left: 120px;

  ${isRtl`
    margin-right: 120px;
    margin-left: auto;
  `}

  ${media.tablet`
    flex: 1 1 auto;
    width: 100%;
    margin-left: 0px;
  `}
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)`
  margin-bottom: 20px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectInfo = ({ projectId, className }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: projectFiles } = useProjectFiles(projectId);
  const isSmallerThanTablet = useBreakpoint('tablet');

  if (project) {
    return (
      <Container className={`${className || ''} e2e-project-info`}>
        <Fragment name={`projects/${project.data.id}/info`}>
          <Left>
            <Title variant="h1" color="tenantText">
              <T value={project.data.attributes.title_multiloc} />
            </Title>

            {isSmallerThanTablet && (
              <StyledProjectArchivedIndicator projectId={projectId} />
            )}

            <Box mb="24px">
              <ReadMoreWrapper
                fontSize="m"
                contentId="description"
                value={project.data.attributes.description_multiloc}
              />
            </Box>

            {projectFiles && projectFiles.data.length > 0 && (
              <Box mb="24px">
                <FileAttachments files={projectFiles.data} />
              </Box>
            )}
          </Left>
          <Right>
            <ProjectInfoSideBar projectId={project.data.id} />
          </Right>
        </Fragment>
      </Container>
    );
  }

  return null;
};

export default ProjectInfo;

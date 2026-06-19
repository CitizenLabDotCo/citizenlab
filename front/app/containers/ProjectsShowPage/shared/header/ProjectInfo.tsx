import React from 'react';

import {
  Box,
  useBreakpoint,
  media,
  isRtl,
  Title,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectFiles from 'api/project_files/useProjectFiles';
import useProjectById from 'api/projects/useProjectById';

import ReadMoreWrapper from 'components/ReadMoreWrapper/ReadMoreWrapper';
import T from 'components/T';
import FileAttachments from 'components/UI/FileAttachments';

import ProjectArchivedIndicator from './ProjectArchivedIndicator';
import ProjectInfoSideBar from './ProjectInfoSideBar';
import ProjectPreviewIndicator from './ProjectPreviewIndicator';

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
        <Left>
          <Title color="tenantText">
            <T value={project.data.attributes.title_multiloc} />
          </Title>
          <Box id={`project-description-${project.data.id}`}>
            {isSmallerThanTablet && (
              <ProjectArchivedIndicator projectId={projectId} mb="20px" />
            )}

            {isSmallerThanTablet && (
              <ProjectPreviewIndicator projectId={projectId} mb="20px" />
            )}
            <Box mb="24px">
              <ReadMoreWrapper
                fontSize="m"
                contentId="description"
                content={
                  <T
                    value={project.data.attributes.description_multiloc}
                    supportHtml
                  />
                }
              />
            </Box>

            {projectFiles && projectFiles.data.length > 0 && (
              <Box mb="24px">
                <FileAttachments files={projectFiles.data} />
              </Box>
            )}
          </Box>
        </Left>
        <Right>
          <ProjectInfoSideBar projectId={project.data.id} />
        </Right>
      </Container>
    );
  }

  return null;
};

export default ProjectInfo;

import React, { memo, useCallback, useState, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Fragment from 'components/Fragment';
import Button from 'components/UI/Button';
import FileAttachments from 'components/UI/FileAttachments';
import ProjectMetaDataSidebar from './ProjectMetaDataSidebar';

// hooks
import useProject from 'hooks/useProject';
import useProjectFiles from 'hooks/useProjectFiles';

// i18n
import T from 'components/T';

// style
import styled, { withTheme } from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 100px;
`;

const Left = styled.div`
  flex: 1;
  padding: 0;
  margin: 0;
`;

const Right = styled.div`
  flex: 0 0 320px;
  width: 320px;
  margin-left: 120px;
`;

const ProjectTitle = styled.h1`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 20px;
  padding: 0;
`;

const ProjectDescription = styled.div`
  position: relative;
  max-height: 200px;
  overflow: hidden;

  &.expanded {
    max-height: unset;
  }
`;

const ReadMoreOuterWrapper = styled.div`
  height: 100px;
  content: '';
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgb(255, 255, 255);
  background: linear-gradient(
    0deg,
    rgba(255, 255, 255, 1) 30%,
    rgba(255, 255, 255, 0) 100%
  );
`;

const ReadMoreInnerWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const ReadMoreButton = styled(Button)`
  position: absolute;
  bottom: 0;
  left: 0;
`;

const ProjectInfo = memo(
  ({ projectId, theme }: { projectId: string; theme: any }) => {
    const project = useProject({ projectId });
    const projectFiles = useProjectFiles(projectId);

    const [expanded, setExpanded] = useState(false);

    const HandleReadMoreClicked = useCallback(
      (event: FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setExpanded(true);
      },
      []
    );

    if (!isNilOrError(project)) {
      return (
        <Container className="e2e-project-info">
          <Fragment name={`projects/${project.id}/info`}>
            <Left>
              <ProjectTitle>
                <T value={project.attributes.title_multiloc} />
              </ProjectTitle>
              <ProjectDescription className={expanded ? 'expanded' : ''}>
                <QuillEditedContent
                  fontSize="large"
                  textColor={theme.colorText}
                >
                  <T
                    value={project.attributes.description_multiloc}
                    supportHtml={true}
                  />
                </QuillEditedContent>
                {!expanded && (
                  <ReadMoreOuterWrapper>
                    <ReadMoreInnerWrapper>
                      <ReadMoreButton
                        buttonStyle="text"
                        onClick={HandleReadMoreClicked}
                        textDecoration="underline"
                        textDecorationHover="underline"
                        textColor={colors.label}
                        textHoverColor={theme.colorText}
                        fontWeight="500"
                        fontSize={`${fontSizes.large}px`}
                        padding="0"
                      >
                        Read more
                      </ReadMoreButton>
                    </ReadMoreInnerWrapper>
                  </ReadMoreOuterWrapper>
                )}
              </ProjectDescription>
              {!isNilOrError(projectFiles) &&
                projectFiles &&
                projectFiles.data.length > 0 && (
                  <FileAttachments files={projectFiles.data} />
                )}
            </Left>

            <Right>
              <ProjectMetaDataSidebar projectId={project.id} />
            </Right>
          </Fragment>
        </Container>
      );
    }

    return null;
  }
);

const ProjectInfoWhithHoC = withTheme(ProjectInfo);

export default ProjectInfoWhithHoC;

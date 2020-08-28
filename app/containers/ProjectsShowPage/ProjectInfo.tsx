import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  FormEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Fragment from 'components/Fragment';
import Button from 'components/UI/Button';
import FileAttachments from 'components/UI/FileAttachments';
import ProjectInfoSideBar from './ProjectInfoSideBar';
import ReactResizeDetector from 'react-resize-detector';

// hooks
import useProject from 'hooks/useProject';
import useProjectFiles from 'hooks/useProjectFiles';

// i18n
import T from 'components/T';

// style
import styled, { useTheme } from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const collapsedDescriptionMaxHeight = 300;

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
  flex: 0 0 300px;
  width: 300px;
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
  height: 100%;
  max-height: ${collapsedDescriptionMaxHeight}px;
  overflow: hidden;

  &.expanded {
    max-height: unset;
  }
`;

const ReadMoreOuterWrapper = styled.div`
  height: 120px;
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

interface Props {
  projectId: string;
  className?: string;
}

const ProjectInfo = memo<Props>(({ projectId, className }) => {
  const theme: any = useTheme();
  const project = useProject({ projectId });
  const projectFiles = useProjectFiles(projectId);

  const [expanded, setExpanded] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState<number | null>(
    null
  );

  useEffect(() => {
    setExpanded(false);
  }, [projectId]);

  const handleReadMoreClicked = useCallback(
    (event: FormEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setExpanded(true);
    },
    []
  );

  const onResize = (_width, height) => {
    setDescriptionHeight(height);
  };

  if (!isNilOrError(project)) {
    return (
      <Container className={`${className || ''} e2e-project-info`}>
        <Fragment name={`projects/${project.id}/info`}>
          <Left>
            <ProjectTitle>
              <T value={project.attributes.title_multiloc} />
            </ProjectTitle>
            <ProjectDescription className={expanded ? 'expanded' : ''}>
              <ReactResizeDetector handleWidth handleHeight onResize={onResize}>
                <div>
                  <QuillEditedContent
                    fontSize="medium"
                    textColor={theme.colorText}
                  >
                    <T
                      value={project.attributes.description_multiloc}
                      supportHtml={true}
                    />
                  </QuillEditedContent>
                </div>
              </ReactResizeDetector>
              {descriptionHeight &&
                descriptionHeight > collapsedDescriptionMaxHeight &&
                !expanded && (
                  <ReadMoreOuterWrapper>
                    <ReadMoreInnerWrapper>
                      <ReadMoreButton
                        buttonStyle="text"
                        onClick={handleReadMoreClicked}
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

              {!isNilOrError(projectFiles) &&
                projectFiles &&
                projectFiles.data.length > 0 && (
                  <FileAttachments files={projectFiles.data} />
                )}
            </ProjectDescription>
          </Left>

          <Right>
            <ProjectInfoSideBar projectId={project.id} />
          </Right>
        </Fragment>
      </Container>
    );
  }

  return null;
});

export default ProjectInfo;

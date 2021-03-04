import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  FormEvent,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import Fragment from 'components/Fragment';
import Button from 'components/UI/Button';
import FileAttachments from 'components/UI/FileAttachments';
import ProjectInfoSideBar from './ProjectInfoSideBar';
import ReactResizeDetector from 'react-resize-detector';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';

// hooks
import useProject from 'hooks/useProject';
import useProjectFiles from 'hooks/useProjectFiles';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// style
import styled, { useTheme } from 'styled-components';
import {
  fontSizes,
  colors,
  media,
  viewportWidths,
  isRtl,
} from 'utils/styleUtils';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const desktopCollapsedDescriptionMaxHeight = 380;
const mobileCollapsedDescriptionMaxHeight = 180;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  `}
`;

const Left = styled.div`
  flex: 1;

  ${media.smallerThanMaxTablet`
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

  ${media.smallerThanMaxTablet`
    flex: 1 1 auto;
    width: 100%;
    margin-left: 0px;
  `}
`;

const ProjectTitle = styled.h1`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 500;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 27px;
  padding: 0;

  ${isRtl`
    text-align: right;
  `}

  ${media.smallerThan1280px`
    font-size: ${fontSizes.xxl}px;
  `}

  ${media.smallerThanMaxTablet`
    margin-bottom: 20px;
  `}
`;

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)`
  margin-bottom: 20px;
`;

const ProjectDescription = styled.div<{ maxHeight: number }>`
  position: relative;
  max-height: ${(props) => props.maxHeight}px;
  overflow: hidden;

  &.expanded {
    max-height: none;
    overflow: visible;
  }
`;

const ReadMoreOuterWrapper = styled.div`
  height: 130px;
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

const CollapseButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
`;

const CollapseButton = styled(Button)``;

interface Props {
  projectId: string;
  className?: string;
}

const ProjectInfo = memo<Props>(({ projectId, className }) => {
  const theme: any = useTheme();
  const project = useProject({ projectId });
  const projectFiles = useProjectFiles(projectId);
  const { windowWidth } = useWindowSize();

  const [expanded, setExpanded] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState<number | null>(
    null
  );

  const smallerThanLargeTablet = windowWidth <= viewportWidths.largeTablet;

  const collapsedDescriptionMaxHeight = smallerThanLargeTablet
    ? mobileCollapsedDescriptionMaxHeight
    : desktopCollapsedDescriptionMaxHeight;

  useEffect(() => {
    setExpanded(false);
  }, [projectId]);

  const toggleExpandCollapse = useCallback(
    (event: FormEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setExpanded((expanded) => !expanded);
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

            {smallerThanLargeTablet && (
              <StyledProjectArchivedIndicator projectId={projectId} />
            )}

            <ProjectDescription
              className={expanded ? 'expanded' : ''}
              maxHeight={collapsedDescriptionMaxHeight}
            >
              {!isEmpty(project.attributes.description_multiloc) && (
                <>
                  <ReactResizeDetector
                    handleWidth
                    handleHeight
                    onResize={onResize}
                  >
                    <div id="e2e-project-description">
                      <QuillEditedContent
                        fontSize="medium"
                        textColor={theme.colorText}
                      >
                        <T
                          value={project.attributes.description_multiloc}
                          supportHtml={true}
                        />
                      </QuillEditedContent>
                      {!isNilOrError(projectFiles) &&
                        projectFiles &&
                        projectFiles.data.length > 0 && (
                          <FileAttachments files={projectFiles.data} />
                        )}
                    </div>
                  </ReactResizeDetector>
                  {descriptionHeight &&
                    descriptionHeight > collapsedDescriptionMaxHeight &&
                    !expanded && (
                      <ReadMoreOuterWrapper>
                        <ReadMoreInnerWrapper>
                          <ReadMoreButton
                            id="e2e-project-description-read-more-button"
                            buttonStyle="text"
                            onClick={toggleExpandCollapse}
                            textDecoration="underline"
                            textDecorationHover="underline"
                            textColor={colors.label}
                            textHoverColor={theme.colorText}
                            fontWeight="500"
                            fontSize={`${fontSizes.medium}px`}
                            padding="0"
                          >
                            <FormattedMessage {...messages.readMore} />
                          </ReadMoreButton>
                        </ReadMoreInnerWrapper>
                      </ReadMoreOuterWrapper>
                    )}
                  {descriptionHeight &&
                    descriptionHeight > collapsedDescriptionMaxHeight &&
                    expanded && (
                      <CollapseButtonWrapper>
                        <CollapseButton
                          id="e2e-project-description-see-less-button"
                          buttonStyle="text"
                          onClick={toggleExpandCollapse}
                          textDecoration="underline"
                          textDecorationHover="underline"
                          textColor={colors.label}
                          textHoverColor={theme.colorText}
                          fontWeight="500"
                          fontSize={`${fontSizes.medium}px`}
                          padding="0"
                        >
                          <FormattedMessage {...messages.seeLess} />
                        </CollapseButton>
                      </CollapseButtonWrapper>
                    )}
                </>
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

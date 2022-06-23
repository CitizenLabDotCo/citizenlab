import React, { memo, useCallback, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import Fragment from 'components/Fragment';
import Button from 'components/UI/Button';
import FileAttachments from 'components/UI/FileAttachments';
import ProjectInfoSideBar from './ProjectInfoSideBar';
import ReactResizeDetector from 'react-resize-detector/build/withPolyfill';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';

// hooks
import useProject from 'hooks/useProject';
import useProjectFiles from 'hooks/useProjectFiles';
import { useWindowSize, Title } from '@citizenlab/cl2-component-library';

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

  const toggleExpandCollapse = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setExpanded((expanded) => !expanded);
  }, []);

  const onResize = (_width: number | undefined, height: number | undefined) => {
    if (height) {
      setDescriptionHeight(height);
    }
  };

  if (!isNilOrError(project)) {
    return (
      <Container className={`${className || ''} e2e-project-info`}>
        <Fragment name={`projects/${project.id}/info`}>
          <Left>
            <Title variant="h1" color="colorText">
              <T value={project.attributes.title_multiloc} />
            </Title>

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
                        fontSize="m"
                        textColor={theme.colorText}
                        disableTabbing={!expanded}
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
                            id="e2e-project-description-read-more-button"
                            buttonStyle="text"
                            onClick={toggleExpandCollapse}
                            textDecoration="underline"
                            textDecorationHover="underline"
                            textColor={colors.label}
                            textHoverColor={theme.colorText}
                            fontWeight="500"
                            fontSize={`${fontSizes.m}px`}
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
                          fontSize={`${fontSizes.m}px`}
                          padding="0"
                        >
                          <FormattedMessage {...messages.seeLess} />
                        </CollapseButton>
                      </CollapseButtonWrapper>
                    )}
                </>
              )}
            </ProjectDescription>
            {!isNilOrError(projectFiles) &&
              projectFiles &&
              projectFiles.data.length > 0 && (
                <FileAttachments files={projectFiles.data} />
              )}
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

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
import { fontSizes, colors, media, viewportWidths } from 'utils/styleUtils';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const desktopCollapsedDescriptionMaxHeight = 400;
const mobileCollapsedDescriptionMaxHeight = 180;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  `}
`;

const Left = styled.div`
  flex: 1;
`;

const Right = styled.div`
  flex: 0 0 300px;
  width: 300px;
  margin-left: 110px;

  ${media.smallerThanMinTablet`
    flex: 1 1 auto;
    width: 100%;
    margin-left: 0px;
  `}
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
  margin-bottom: 27px;
  padding: 0;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xxxl}px;
    margin-bottom: 20px;
  `}
`;

const ProjectDescription = styled.div<{ maxHeight: number }>`
  position: relative;
  max-height: ${(props) => props.maxHeight}px;
  overflow: hidden;

  &.expanded {
    max-height: unset;
  }

  ${media.smallerThanMinTablet`
    margin-bottom: 30px;
  `}
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
    rgba(255, 255, 255, 1) 25%,
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

  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;

  const collapsedDescriptionMaxHeight = smallerThanSmallTablet
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
                          <FormattedMessage {...messages.collapse} />
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

import React, { memo, useState, useEffect, useCallback } from 'react';

import {
  useWindowSize,
  Box,
  media,
  fontSizes,
  isRtl,
  colors,
} from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import ReactResizeDetector from 'react-resize-detector';
import styled, { useTheme } from 'styled-components';

import useProjectFolderFiles from 'api/project_folder_files/useProjectFolderFiles';
import { IProjectFolderData } from 'api/project_folders/types';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import FileAttachments from 'components/UI/FileAttachments';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { ScreenReaderOnly } from 'utils/a11y';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const desktopCollapsedDescriptionMaxHeight = 99999;
const mobileCollapsedDescriptionMaxHeight = 180;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.xxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 25px;
  padding: 0;

  ${isRtl`
    text-align: right;
  `}

  ${media.tablet`
    margin-bottom: 20px;
  `}
`;

const Description = styled.div<{ maxHeight: number }>`
  position: relative;
  max-height: ${(props) => props.maxHeight}px;
  overflow: hidden;
  margin-bottom: 28px;

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

const ReadMoreButton = styled(ButtonWithLink)`
  position: absolute;
  bottom: 0;
  left: 0;
`;

const CollapseButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
`;

const CollapseButton = styled(ButtonWithLink)``;

interface Props {
  projectFolder: IProjectFolderData;
  className?: string;
}

const ProjectFolderDescription = memo<Props & WrappedComponentProps>(
  ({ projectFolder, className, intl: { formatMessage } }) => {
    const { data: projectFolderFiles } = useProjectFolderFiles({
      projectFolderId: projectFolder.id,
    });
    const { windowWidth } = useWindowSize();
    const theme = useTheme();

    const [expanded, setExpanded] = useState(false);
    const [descriptionHeight, setDescriptionHeight] = useState<number | null>(
      null
    );

    const smallerThan1100px = windowWidth ? windowWidth <= 1100 : false;

    const collapsedDescriptionMaxHeight = smallerThan1100px
      ? mobileCollapsedDescriptionMaxHeight
      : desktopCollapsedDescriptionMaxHeight;

    useEffect(() => {
      setExpanded(false);
    }, [projectFolder, descriptionHeight]);

    const toggleExpandCollapse = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      setExpanded((expanded) => !expanded);
    }, []);

    const onResize = (
      _width: number | undefined,
      height: number | undefined
    ) => {
      if (height) {
        setDescriptionHeight(height);
      }
    };

    const showReadMoreButton = !!(
      descriptionHeight &&
      descriptionHeight > collapsedDescriptionMaxHeight &&
      !expanded
    );

    if (!isNilOrError(projectFolder)) {
      return (
        <Container className={className || ''}>
          <ScreenReaderOnly>
            <h2>{formatMessage(messages.invisibleTitleMainContent)}</h2>
          </ScreenReaderOnly>
          <Title id="e2e-folder-title">
            <T value={projectFolder.attributes.title_multiloc} />
          </Title>
          <Description
            className={expanded ? 'expanded' : ''}
            maxHeight={collapsedDescriptionMaxHeight}
          >
            <ReactResizeDetector handleWidth handleHeight onResize={onResize}>
              <div>
                <QuillEditedContent
                  textColor={theme.colors.tenantText}
                  fontSize="m"
                  className="e2e-folder-description"
                  disableTabbing={showReadMoreButton}
                >
                  <T
                    value={projectFolder.attributes.description_multiloc}
                    supportHtml={true}
                  />
                </QuillEditedContent>
              </div>
            </ReactResizeDetector>
            {showReadMoreButton && (
              <ReadMoreOuterWrapper>
                <ReadMoreInnerWrapper>
                  <ReadMoreButton
                    id="e2e-project-description-read-more-button"
                    buttonStyle="text"
                    onClick={toggleExpandCollapse}
                    textDecoration="underline"
                    textDecorationHover="underline"
                    textColor={colors.textSecondary}
                    textHoverColor={theme.colors.tenantText}
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
                    textColor={colors.textSecondary}
                    textHoverColor={theme.colors.tenantText}
                    fontWeight="500"
                    fontSize={`${fontSizes.m}px`}
                    padding="0"
                  >
                    <FormattedMessage {...messages.seeLess} />
                  </CollapseButton>
                </CollapseButtonWrapper>
              )}
          </Description>
          {projectFolderFiles && projectFolderFiles.data.length > 0 && (
            <Box mb="25px">
              <FileAttachments files={projectFolderFiles.data} />
            </Box>
          )}
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(ProjectFolderDescription);

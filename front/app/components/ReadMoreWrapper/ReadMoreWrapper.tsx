import React, { memo, useCallback, useState, useEffect, useRef } from 'react';

import {
  useWindowSize,
  Box,
  fontSizes,
  colors,
  media,
  viewportWidths,
  isRtl,
  Button,
} from '@citizenlab/cl2-component-library';
import ReactResizeDetector from 'react-resize-detector';
import styled, { useTheme } from 'styled-components';

import messages from 'containers/ProjectsShowPage/messages';

import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage } from 'utils/cl-intl';

const desktopCollapsedContentMaxHeight = 380;
const mobileCollapsedContentMaxHeight = 180;

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

const Content = styled.div<{ maxHeight: number }>`
  position: relative;
  max-height: ${(props) => props.maxHeight}px;
  overflow: hidden;

  &.expanded {
    max-height: none;
    overflow: visible;
  }
`;

const ReadMoreButton = styled(Button)`
  position: absolute;
  bottom: 0;
  left: 0;
`;

interface Props {
  className?: string;
  contentId?: string;
  fontSize: 'base' | 's' | 'm' | 'l';
  content: JSX.Element | string;
}

const ReadMoreWrapper = memo<Props>(
  ({ className, content, fontSize, contentId }) => {
    const theme = useTheme();
    const { windowWidth } = useWindowSize();

    const [expanded, setExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState<number | null>(null);

    const readMoreButtonRef = useRef<HTMLButtonElement>(null);
    const seeLessButtonRef = useRef<HTMLButtonElement>(null);

    const smallerThanLargeTablet = windowWidth <= viewportWidths.tablet;
    const collapsedContentMaxHeight = smallerThanLargeTablet
      ? mobileCollapsedContentMaxHeight
      : desktopCollapsedContentMaxHeight;

    useEffect(() => {
      setExpanded(false);
    }, [content]);

    useEffect(() => {
      const buttonToFocus = expanded
        ? seeLessButtonRef.current
        : readMoreButtonRef.current;

      if (buttonToFocus) {
        // Add a small timeout to ensure DOM is stable before focusing.
        setTimeout(() => {
          // We move focus to the other button after clicking to make sure the screen reader reads it
          buttonToFocus.focus({ preventScroll: true });
        }, 0);
      }
    }, [contentId, expanded]);

    const toggleExpandCollapse = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      setExpanded((prevExpanded) => !prevExpanded);
    }, []);

    const onResize = (
      _width: number | undefined,
      height: number | undefined
    ) => {
      if (height) {
        setContentHeight(height);
      }
    };

    return (
      <Container className={`${className || ''}`}>
        <Content
          className={expanded ? 'expanded' : ''}
          maxHeight={collapsedContentMaxHeight}
        >
          <>
            <ReactResizeDetector handleWidth handleHeight onResize={onResize}>
              <div id={`e2e-project-${contentId}`}>
                <QuillEditedContent
                  fontSize={fontSize}
                  textColor={theme.colors.tenantText}
                >
                  {content}
                </QuillEditedContent>
              </div>
            </ReactResizeDetector>
            {contentHeight &&
              contentHeight > collapsedContentMaxHeight &&
              !expanded && (
                <Box
                  display="flex"
                  height="132px"
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  background="linear-gradient(0deg, rgba(255, 255, 255, 1) 30%, rgba(255, 255, 255, 0) 100%)"
                >
                  <Box position="relative" flex="1">
                    <ReadMoreButton
                      id={`e2e-project-${contentId}-read-more-button`}
                      buttonStyle="text"
                      onClick={toggleExpandCollapse}
                      textDecoration="underline"
                      textDecorationHover="underline"
                      textColor={colors.textSecondary}
                      textHoverColor={theme.colors.tenantText}
                      fontWeight="500"
                      fontSize={`${fontSizes.m}px`}
                      padding="0"
                      ariaExpanded={false}
                      ariaControls={`e2e-project-${contentId}`}
                      icon="arrow-down"
                      iconPos="right"
                      iconSize="16px"
                      ref={readMoreButtonRef}
                      type="button"
                    >
                      <FormattedMessage {...messages.readMore} />
                    </ReadMoreButton>
                  </Box>
                </Box>
              )}
            {contentHeight &&
              contentHeight > collapsedContentMaxHeight &&
              expanded && (
                <Box display="flex" justifyContent="flex-start" mt="20px">
                  <Button
                    id={`e2e-project-${contentId}-see-less-button`}
                    buttonStyle="text"
                    onClick={toggleExpandCollapse}
                    textDecoration="underline"
                    textDecorationHover="underline"
                    textColor={colors.textSecondary}
                    textHoverColor={theme.colors.tenantText}
                    fontWeight="500"
                    fontSize={`${fontSizes.m}px`}
                    padding="0"
                    ariaExpanded={true}
                    ariaControls={`e2e-project-${contentId}`}
                    icon="arrow-up"
                    iconPos="right"
                    iconSize="16px"
                    ref={seeLessButtonRef}
                    type="button"
                  >
                    <FormattedMessage {...messages.readLess} />
                  </Button>
                </Box>
              )}
          </>
        </Content>
      </Container>
    );
  }
);

export default ReadMoreWrapper;

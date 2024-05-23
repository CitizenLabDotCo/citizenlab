import React, { memo, useCallback, useState, useEffect, useRef } from 'react';

import {
  useWindowSize,
  Box,
  fontSizes,
  colors,
  media,
  viewportWidths,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import ReactResizeDetector from 'react-resize-detector';
import styled, { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import messages from 'containers/ProjectsShowPage/messages';

import T from 'components/T';
import Button from 'components/UI/Button';
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
  value: Multiloc;
}

const ReadMoreWrapper = memo<Props>(
  ({ className, value, fontSize, contentId }) => {
    const theme = useTheme();
    const { windowWidth } = useWindowSize();

    const [expanded, setExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    const buttonContainerRef = useRef<HTMLDivElement>(null);

    const smallerThanLargeTablet = windowWidth <= viewportWidths.tablet;
    const collapsedContentMaxHeight = smallerThanLargeTablet
      ? mobileCollapsedContentMaxHeight
      : desktopCollapsedContentMaxHeight;

    useEffect(() => {
      setExpanded(false);
    }, [value]);

    useEffect(() => {
      // We use the button container ref because we currently don't support refs
      // on the buttons themselves. Adding that for this use case would be a bit more complex since
      // the button component handles links too
      const container = buttonContainerRef.current;
      if (!container) return;

      const readMoreButton = container.querySelector<HTMLButtonElement>(
        `#e2e-project-${contentId}-read-more-button button`
      );
      const seeLessButton = container.querySelector<HTMLButtonElement>(
        `#e2e-project-${contentId}-see-less-button button`
      );

      const buttonToFocus = readMoreButton || seeLessButton;
      if (buttonToFocus) {
        // We move focus to the other button after clicking to make sure the screen reader reads it
        buttonToFocus.focus();
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
          {!isEmpty(value) && (
            <>
              <ReactResizeDetector handleWidth handleHeight onResize={onResize}>
                <div id={`e2e-project-${contentId}`}>
                  <QuillEditedContent
                    fontSize={fontSize}
                    textColor={theme.colors.tenantText}
                  >
                    <T value={value} supportHtml={true} />
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
                    <Box position="relative" flex="1" ref={buttonContainerRef}>
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
                        ariaExpanded={expanded}
                      >
                        <FormattedMessage {...messages.readMore} />
                      </ReadMoreButton>
                    </Box>
                  </Box>
                )}
              {contentHeight &&
                contentHeight > collapsedContentMaxHeight &&
                expanded && (
                  <Box
                    display="flex"
                    justifyContent="flex-start"
                    mt="20px"
                    ref={buttonContainerRef}
                  >
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
                      ariaExpanded={expanded}
                    >
                      <FormattedMessage {...messages.readLess} />
                    </Button>
                  </Box>
                )}
            </>
          )}
        </Content>
      </Container>
    );
  }
);

export default ReadMoreWrapper;

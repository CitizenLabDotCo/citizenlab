import React, { memo, useCallback, useState, useEffect } from 'react';
import { isEmpty } from 'lodash-es';

// components
import Button from 'components/UI/Button';
import ReactResizeDetector from 'react-resize-detector';

// hooks
import { useWindowSize, Box } from '@citizenlab/cl2-component-library';

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

import { Multiloc } from 'typings';

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

    const smallerThanLargeTablet = windowWidth <= viewportWidths.tablet;

    const collapsedContentMaxHeight = smallerThanLargeTablet
      ? mobileCollapsedContentMaxHeight
      : desktopCollapsedContentMaxHeight;

    useEffect(() => {
      setExpanded(false);
    }, [value]);

    const toggleExpandCollapse = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      setExpanded((expanded) => !expanded);
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
                    disableTabbing={!expanded}
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

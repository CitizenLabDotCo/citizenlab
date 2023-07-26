import React, { useState, useEffect, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import FileAttachments from 'components/UI/FileAttachments';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import ReactResizeDetector from 'react-resize-detector';
import Button from 'components/UI/Button';

// api
import { useWindowSize, Box } from '@citizenlab/cl2-component-library';
import useEventFiles from 'api/event_files/useEventFiles';

// i18n
import T from 'components/T';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled, { useTheme } from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
import { IEventData } from 'api/events/types';

const desktopCollapsedDescriptionMaxHeight = 99999;
const mobileCollapsedDescriptionMaxHeight = 180;

const Description = styled.div<{ maxHeight: number }>`
  position: relative;
  max-height: ${(props) => props.maxHeight}px;
  overflow: hidden;
  margin-bottom: 20px;

  &.expanded {
    max-height: none;
    overflow: visible;
  }
`;

const ReadMoreWrapper = styled.div`
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

interface Props {
  event: IEventData;
}

const EventDescription = ({ event }: Props) => {
  const { formatMessage } = useIntl();
  const { data: eventFiles } = useEventFiles(event.id);
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
  }, [event, descriptionHeight]);

  const toggleExpandCollapse = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setExpanded((expanded) => !expanded);
  }, []);

  const onResize = (_width: number | undefined, height: number | undefined) => {
    if (height) {
      setDescriptionHeight(height);
    }
  };

  if (!isNilOrError(event)) {
    return (
      <Box display="flex" flexDirection="column" alignItems="stretch">
        <ScreenReaderOnly>
          <h2>{formatMessage(messages.invisibleTitleMainContent)}</h2>
        </ScreenReaderOnly>
        <Description
          className={expanded ? 'expanded' : ''}
          maxHeight={collapsedDescriptionMaxHeight}
        >
          <ReactResizeDetector handleWidth handleHeight onResize={onResize}>
            <div>
              <QuillEditedContent
                textColor={theme.colors.tenantText}
                fontSize="m"
                className="e2e-event-description"
                disableTabbing={!expanded}
              >
                <T
                  value={event.attributes.description_multiloc}
                  supportHtml={true}
                />
              </QuillEditedContent>
            </div>
          </ReactResizeDetector>
          {descriptionHeight &&
            descriptionHeight > collapsedDescriptionMaxHeight &&
            !expanded && (
              <ReadMoreWrapper>
                <Box position="relative" flex="1">
                  <Button
                    position="absolute"
                    bottom="0"
                    left="0"
                    id="e2e-event-description-read-more-button"
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
                    <FormattedMessage {...messages.showMore} />
                  </Button>
                </Box>
              </ReadMoreWrapper>
            )}

          {descriptionHeight &&
            descriptionHeight > collapsedDescriptionMaxHeight &&
            expanded && (
              <Box display="flex" justifyContent="flex-start" marginTop="20px">
                <Button
                  id="e2e-event-description-see-less-button"
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
                  <FormattedMessage {...messages.showLess} />
                </Button>
              </Box>
            )}
        </Description>
        {eventFiles && eventFiles.data.length > 0 && (
          <Box mb="25px">
            <FileAttachments files={eventFiles.data} />
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default EventDescription;

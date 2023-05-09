import React, { useRef, useState, useEffect } from 'react';
import { isEmpty, every } from 'lodash-es';
import moment from 'moment';

// components
import Link from 'utils/cl-router/Link';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { Icon, Text, Box } from '@citizenlab/cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';

// hooks
// import useProject from 'hooks/useProject';
import useEventFiles from 'api/event_files/useEventFiles';
import useProjectById from 'api/projects/useProjectById';

// services
import { IEventData } from 'api/events/types';

// i18n
import T from 'components/T';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled, { useTheme } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// other
import checkTextOverflow from './checkTextOverflow';
import { isNilOrError } from 'utils/helperUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const EventInformationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 23px;
  margin-top: 4px;
`;

const EventTitleAndAttributes = styled.div`
  margin-bottom: 25px;
`;

const StyledLink = styled(Link)`
  cursor: pointer;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.xs}px;
  display: block;
  margin: 0 0 5px 0;

  &:hover {
    color: ${({ theme }) => theme.colors.tenantPrimary};
  }
`;

const EventTitle = styled.h3<{ fontSize?: number }>`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${({ fontSize }) => fontSize ?? fontSizes.xl}px;
  font-weight: 700;
  line-height: normal;
  margin: 0 0 9px 0 !important;

  &:hover {
    color: ${({ theme }) => theme.colors.tenantPrimary};
  }
`;

const EventTimeAndLocationContainer = styled.div`
  display: flex;
  flex-direction: row;

  ${media.phone`
    flex-direction: column;
  `}

  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.xs}px;
`;

const Time = styled.time`
  margin-right: 23px;

  ${media.phone`
    margin-bottom: 5px;
    margin-right: 0px;
  `}
`;

const Location = styled.div``;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  margin-top: -1.5px;

  ${media.phone`
    margin-right: 6px;
  `}
`;

const EventDescription = styled.div`
  margin-bottom: 24px;
`;

const SMALL_LINE_HEIGHT = fontSizes.s + 2.45;

interface IStyledT {
  hideTextOverflow?: boolean;
}

// https://css-tricks.com/line-clampin/#the-fade-out-way
const StyledT = styled(T)<IStyledT>`
  ${({ hideTextOverflow }) => {
    if (!hideTextOverflow) return '';

    return `
      overflow: hidden;
      height: calc(${SMALL_LINE_HEIGHT}px * 4);

      &:after {
        content: "";
        text-align: right;
        position: absolute;
        bottom: 0;
        right: 0;
        width: 100%;
        height: ${SMALL_LINE_HEIGHT * 2}px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 100%);
      }
    `;
  }}

  p {
    font-size: ${fontSizes.s}px;
    line-height: ${SMALL_LINE_HEIGHT}px;
  }

  color: ${(props) => props.theme.colors.tenantText};
  position: relative;
  display: block;
`;

const ShowMoreOrLessButton = styled.button`
  margin-top: 18px;
  padding: 0;
  color: ${colors.textSecondary};
  cursor: pointer;
  font-weight: 600;
  text-decoration-line: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.tenantPrimary};
    text-decoration-line: none;
  }
`;

interface Props {
  event: IEventData;
  startAtMoment: moment.Moment;
  endAtMoment: moment.Moment;
  isMultiDayEvent: boolean;
  showProjectTitle?: boolean;
  showLocation?: boolean;
  showDescription?: boolean;
  showAttachments?: boolean;
  titleFontSize?: number;
  onClickTitleGoToProjectAndScrollToEvent?: boolean;
}

const EventInformation = ({
  event,
  isMultiDayEvent,
  startAtMoment,
  endAtMoment,
  showProjectTitle,
  showLocation,
  showDescription,
  showAttachments,
  titleFontSize,
  onClickTitleGoToProjectAndScrollToEvent,
}: Props) => {
  const { formatMessage } = useIntl();

  const theme = useTheme();

  const { data: eventFiles } = useEventFiles(event.id);

  const hasLocation = !every(event.attributes.location_multiloc, isEmpty);
  const eventDateTime = isMultiDayEvent
    ? `${startAtMoment.format('LLL')} - ${endAtMoment.format('LLL')}`
    : `${startAtMoment.format('LL')} • ${startAtMoment.format(
        'LT'
      )} - ${endAtMoment.format('LT')}`;

  const projectId = event.relationships.project.data.id;
  const { data: project } = useProjectById(projectId);

  const projectTitle = project?.data.attributes.title_multiloc;
  const projectSlug = project?.data.attributes.slug;

  const TElement = useRef(null);

  const [textOverflow, setTextOverflow] = useState(true);
  const [hideTextOverflow, setHideTextOverflow] = useState(true);
  const [a11y_showMoreHelperText, setA11y_showMoreHelperText] = useState('');

  const toggleHiddenText = () => {
    if (hideTextOverflow) {
      setHideTextOverflow(false);
      setA11y_showMoreHelperText(
        formatMessage(messages.a11y_moreContentVisible)
      );
    } else {
      setHideTextOverflow(true);
      setA11y_showMoreHelperText(
        formatMessage(messages.a11y_lessContentVisible)
      );
    }
  };

  useEffect(() => {
    if (textOverflow === false || showDescription === false) return;

    setTextOverflow(true);

    setTimeout(() => {
      setTextOverflow(!!checkTextOverflow(TElement));
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TElement]);

  return (
    <EventInformationContainer data-testid="EventInformation">
      <EventTitleAndAttributes>
        {showProjectTitle &&
          projectTitle &&
          onClickTitleGoToProjectAndScrollToEvent && (
            <StyledLink to={`/projects/${projectSlug}`}>
              <T value={projectTitle} />
            </StyledLink>
          )}
        {showProjectTitle &&
          projectTitle &&
          !onClickTitleGoToProjectAndScrollToEvent && (
            <Text color="textSecondary" fontSize="xs" margin="0 0  5px 0">
              <T value={projectTitle} />
            </Text>
          )}
        {onClickTitleGoToProjectAndScrollToEvent && (
          <Link to={`/projects/${projectSlug}?scrollToEventId=${event.id}`}>
            <EventTitle fontSize={titleFontSize}>
              <T value={event.attributes.title_multiloc} />
            </EventTitle>
          </Link>
        )}

        {!onClickTitleGoToProjectAndScrollToEvent && (
          <EventTitle fontSize={titleFontSize}>
            <T value={event.attributes.title_multiloc} />
          </EventTitle>
        )}

        <EventTimeAndLocationContainer>
          <Time>
            <StyledIcon
              name="clock"
              fill={colors.textSecondary}
              marginRight="6px"
            />
            {eventDateTime}
          </Time>

          {hasLocation && showLocation && (
            <Location>
              <StyledIcon name="position" marginRight="6px" />
              <T value={event.attributes.location_multiloc} />
            </Location>
          )}
        </EventTimeAndLocationContainer>
      </EventTitleAndAttributes>

      {showDescription && (
        <EventDescription>
          <QuillEditedContent
            disableTabbing={hideTextOverflow && textOverflow}
            textColor={theme.colors.tenantText}
          >
            <StyledT
              value={event.attributes.description_multiloc}
              supportHtml={true}
              ref={TElement}
              wrapInDiv={true}
              hideTextOverflow={hideTextOverflow && textOverflow}
            />
          </QuillEditedContent>

          {((textOverflow && hideTextOverflow) || !hideTextOverflow) && (
            <>
              <ShowMoreOrLessButton onClick={toggleHiddenText}>
                {formatMessage(
                  hideTextOverflow ? messages.showMore : messages.showLess
                )}
              </ShowMoreOrLessButton>
              <ScreenReaderOnly aria-live="polite">
                {a11y_showMoreHelperText}
              </ScreenReaderOnly>
            </>
          )}
        </EventDescription>
      )}

      {!isNilOrError(eventFiles) &&
        eventFiles.data.length > 0 &&
        showAttachments && (
          <Box mb="24px">
            <FileAttachments files={eventFiles.data} />
          </Box>
        )}
    </EventInformationContainer>
  );
};

export default EventInformation;

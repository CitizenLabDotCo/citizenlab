import React, { memo, useRef, useState, useEffect } from 'react';
import { isEmpty, every } from 'lodash-es';
import moment from 'moment';

// components
import Link from 'utils/cl-router/Link';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { Icon } from '@citizenlab/cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';
import Attendees from './Attendees';

// hooks
import useResourceFiles from 'hooks/useResourceFiles';
import useProject from 'hooks/useProject';

// services
import { IEventData } from 'services/events';

// i18n
import T from 'components/T';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
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
  color: ${colors.label};
  font-size: ${fontSizes.xs}px;
  display: block;
  margin: 0 0 5px 0;

  &:hover {
    color: ${({ theme }) => theme.colorMain};
  }
`;

const EventTitle = styled.h3<{ fontSize?: number }>`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${({ fontSize }) => fontSize ?? fontSizes.xl}px;
  font-weight: 700;
  line-height: normal;
  margin: 0 0 9px 0 !important;

  &:hover {
    color: ${({ theme }) => theme.colorMain};
  }
`;

const EventAttributeContainer = styled.div<{ verticalAttributes?: boolean }>`
  display: flex;
  flex-direction: ${({ verticalAttributes }) =>
    verticalAttributes ? 'column' : 'row'};
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xs}px;
`;

const EventAttribute = styled.div<{ verticalAttributes?: boolean }>`
  margin-right: 23px;

  ${({ verticalAttributes }) =>
    verticalAttributes
      ? `
        margin-bottom: 5px;
        margin-right: 0px;
      `
      : ''}

  &:last-of-type {
    margin: 0px;
  }
`;

interface StyledIconProps {
  width: number;
  height: number;
  marginRight: number;
}

const StyledIcon = styled(Icon)<StyledIconProps>`
  flex: 0 0 24px;
  fill: ${colors.label};
  margin-right: ${({ marginRight }) => marginRight}px;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  margin-top: -1.5px;

  ${media.smallerThanMinTablet`
    margin-right: 6px;
  `}
`;

const EventDescription = styled.div``;

const SMALL_LINE_HEIGHT = fontSizes.small + 2.45;

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
    font-size: ${fontSizes.small}px;
    line-height: ${SMALL_LINE_HEIGHT}px;
  }

  color: ${(props: any) => props.theme.colorText};
  position: relative;
  display: block;
`;

const ShowMoreOrLessButton = styled.button`
  margin-top: 18px;
  padding: 0;
  color: ${colors.label};
  cursor: pointer;
  font-weight: 600;
  text-decoration-line: underline;

  &:hover {
    color: ${({ theme }) => theme.colorMain};
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
  verticalAttributes?: boolean;
}

const EventInformation = memo<Props & InjectedIntlProps>((props) => {
  const {
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
    verticalAttributes,
    intl,
  } = props;

  const theme: any = useTheme();

  const eventFiles = useResourceFiles({
    resourceType: 'event',
    resourceId: event.id,
  });

  const hasLocation = !every(event.attributes.location_multiloc, isEmpty);
  const eventDateTime = isMultiDayEvent
    ? `${startAtMoment.format('LLL')} - ${endAtMoment.format('LLL')}`
    : `${startAtMoment.format('LL')} • ${startAtMoment.format(
        'LT'
      )} - ${endAtMoment.format('LT')}`;

  const projectId = event.relationships.project.data.id;
  const project = useProject({ projectId });
  const projectTitle = project?.attributes.title_multiloc;
  const projectSlug = project?.attributes.slug;

  const TElement = useRef(null);

  const [textOverflow, setTextOverflow] = useState(true);
  const [hideTextOverflow, setHideTextOverflow] = useState(true);
  const [a11y_showMoreHelperText, setA11y_showMoreHelperText] = useState('');

  const toggleHiddenText = () => {
    if (hideTextOverflow) {
      setHideTextOverflow(false);
      setA11y_showMoreHelperText(
        intl.formatMessage(messages.a11y_moreContentVisible)
      );
    } else {
      setHideTextOverflow(true);
      setA11y_showMoreHelperText(
        intl.formatMessage(messages.a11y_lessContentVisible)
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
        {showProjectTitle && projectTitle && (
          <StyledLink to={`/projects/${projectSlug}`}>
            <T value={projectTitle} />
          </StyledLink>
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

        <EventAttributeContainer verticalAttributes={verticalAttributes}>
          <EventAttribute verticalAttributes={verticalAttributes}>
            <StyledIcon
              name="clock-solid"
              width={fontSizes.medium}
              height={fontSizes.medium}
              marginRight={6}
            />
            <time>{eventDateTime}</time>
          </EventAttribute>

          {hasLocation && showLocation && (
            <EventAttribute verticalAttributes={verticalAttributes}>
              <StyledIcon
                name="mapmarker"
                width={fontSizes.medium}
                height={fontSizes.medium}
                marginRight={3}
              />
              <T value={event.attributes.location_multiloc} />
            </EventAttribute>
          )}

          <EventAttribute verticalAttributes={verticalAttributes}>
            <StyledIcon
              name="person"
              width={fontSizes.medium}
              height={fontSizes.medium}
              marginRight={5}
            />
            {intl.formatMessage(messages.attending, {
              count: event.attributes.attendances_count,
            })}
          </EventAttribute>
        </EventAttributeContainer>
      </EventTitleAndAttributes>

      {showDescription && (
        <EventDescription>
          <QuillEditedContent textColor={theme.colorText}>
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
                {intl.formatMessage(
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
        eventFiles.length > 0 &&
        showAttachments && <FileAttachments files={eventFiles} />}

      <Attendees
        eventId={event.id}
        attendanceCount={event.attributes.attendances_count}
      />
    </EventInformationContainer>
  );
});

export default injectIntl(EventInformation);

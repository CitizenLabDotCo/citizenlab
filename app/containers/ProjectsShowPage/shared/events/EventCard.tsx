import React, { memo } from 'react';
import moment from 'moment';
import { isEmpty, every } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';

// hooks
import useResourceFiles from 'hooks/useResourceFiles';
import useWindowSize from 'hooks/useWindowSize';

// services
import { IEventData } from 'services/events';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// utils
import { getIsoDate } from 'utils/dateUtils';

// style
import styled, { useTheme } from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  viewportWidths,
} from 'utils/styleUtils';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  width: 100%;
  padding: 17px;
  display: flex;
  ${defaultCardStyle};
  box-shadow: none;
  border: solid 1px #ccc;
`;

const EventDateBlocks = styled.div`
  flex: 0 0 75px;
  width: 75px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.smallerThanMinTablet`
    flex: 0 0 60px;
    width: 60x;
  `}
`;

const Separator = styled.div`
  height: 18px;

  ${media.smallerThanMinTablet`
    width: 15px;
    height: auto;
  `}
`;

const EventDateBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.second {
    margin-top: 14px;
  }
`;

const EventDateBlockLabel = styled.div`
  color: ${colors.label};
  font-size: 12px;
  line-height: normal;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const EventDateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  padding: 6px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: #f5f6f7;
  border: solid 1px #ccc;
  border-bottom: none;

  ${media.smallerThanMinTablet`
    padding: 4px;
  `}
`;

const EventMonth = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: 14px;
  line-height: normal;
  font-weight: 500;
  text-transform: uppercase;
`;

const EventDay = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: 18px;
  line-height: normal;
  font-weight: 400;

  ${media.smallerThanMinTablet`
    font-size: 16px;
  `}
`;

const EventYear = styled.div`
  color: #fff;
  font-size: 16px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: ${colors.label};

  ${media.smallerThanMinTablet`
    font-size: 14px;
  `}
`;

const EventInformation = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 20px;
`;

const EventMetaAndTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 20px;
`;

const EventMeta = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 5px;
`;

const EventTitle = styled.h3`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  padding: 0;
  margin: 0;
`;

const EventDescription = styled.div``;

const EventLocationWrapper = styled.div`
  width: 250px;
  flex: 0 0 250px;
  padding: 20px;
  display: flex;
  align-items: center;
  border-left: 1px solid #ccc;
  margin-left: 40px;
`;

const EventLocation = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 20px;
  margin-right: 10px;

  ${media.smallerThanMaxTablet`
    margin: 0;
    margin-bottom: 20px;
  `}
`;

const MapIcon = styled(Icon)`
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  fill: ${colors.label};
  margin-right: 6px;
`;

const EventLocationAddress = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

interface InputProps {
  event: IEventData;
  className?: string;
}

interface Props extends InputProps {}

const EventCard = memo<Props>(({ event, className }) => {
  const theme: any = useTheme();
  const eventFiles = useResourceFiles({
    resourceType: 'event',
    resourceId: event.id,
  });
  const windowSize = useWindowSize();
  const smallerThanLargeTablet = windowSize
    ? windowSize.windowWidth <= viewportWidths.largeTablet
    : false;

  if (!isNilOrError(event)) {
    const startAtMoment = moment(event.attributes.start_at);
    const endAtMoment = moment(event.attributes.end_at);
    const startAtIsoDate = getIsoDate(event.attributes.start_at);
    const endAtIsoDate = getIsoDate(event.attributes.end_at);
    const startAtDay = startAtMoment.format('DD');
    const endAtDay = endAtMoment.format('DD');
    const startAtMonth = startAtMoment.format('MMM');
    const endAtMonth = endAtMoment.format('MMM');
    const startAtYear = startAtMoment.format('YYYY');
    const endAtYear = endAtMoment.format('YYYY');
    const isMultiDayEvent = startAtIsoDate !== endAtIsoDate;
    const isMultiMonth = startAtMonth !== endAtMonth;
    const isMultiYear = startAtYear !== endAtYear;
    const hasLocation = !every(event.attributes.location_multiloc, isEmpty);
    const eventDateTime = isMultiDayEvent
      ? `${startAtMoment.format('lll')} - ${endAtMoment.format('lll')}`
      : `${startAtMoment.format('ll')} • ${startAtMoment.format(
          'LT'
        )} - ${endAtMoment.format('LT')}`;

    return (
      <Container className={className || ''}>
        <EventDateBlocks>
          <EventDateBlockWrapper className={isMultiYear ? 'first' : ''}>
            {isMultiYear && (
              <EventDateBlockLabel>
                <FormattedMessage {...messages.startsAt} />
              </EventDateBlockLabel>
            )}
            <EventDateBlock>
              <EventDate>
                <EventMonth>{startAtMonth}</EventMonth>
                <EventDay>{startAtDay}</EventDay>
                {isMultiDayEvent && !isMultiYear && (
                  <>
                    <Separator>-</Separator>
                    {isMultiMonth && <EventMonth>{endAtMonth}</EventMonth>}
                    <EventDay>{endAtDay}</EventDay>
                  </>
                )}
              </EventDate>
              <EventYear>
                <span>{startAtYear}</span>
              </EventYear>
            </EventDateBlock>
          </EventDateBlockWrapper>

          {isMultiDayEvent && isMultiYear && (
            <EventDateBlockWrapper className={isMultiYear ? 'second' : ''}>
              {isMultiYear && (
                <EventDateBlockLabel>
                  <FormattedMessage {...messages.endsAt} />
                </EventDateBlockLabel>
              )}
              <EventDateBlock>
                <EventDate>
                  <EventMonth>{endAtMonth}</EventMonth>
                  <EventDay>{endAtDay}</EventDay>
                </EventDate>
                <EventYear>
                  <span>{endAtYear}</span>
                </EventYear>
              </EventDateBlock>
            </EventDateBlockWrapper>
          )}
        </EventDateBlocks>

        <EventInformation>
          <EventMetaAndTitle>
            <EventMeta>{eventDateTime}</EventMeta>

            <EventTitle>
              <T value={event.attributes.title_multiloc} />
            </EventTitle>
          </EventMetaAndTitle>

          {smallerThanLargeTablet && hasLocation && (
            <EventLocation>
              <MapIcon name="mapmarker" />
              <EventLocationAddress>
                <T value={event.attributes.location_multiloc} />
              </EventLocationAddress>
            </EventLocation>
          )}

          <EventDescription>
            <QuillEditedContent textColor={theme.colorText}>
              <T
                value={event.attributes.description_multiloc}
                supportHtml={true}
              />
            </QuillEditedContent>
          </EventDescription>

          {!isNilOrError(eventFiles) && eventFiles.length > 0 && (
            <FileAttachments files={eventFiles} />
          )}
        </EventInformation>

        {!smallerThanLargeTablet && hasLocation && (
          <EventLocationWrapper>
            <EventLocation>
              <MapIcon name="mapmarker" />
              <EventLocationAddress>
                <T value={event.attributes.location_multiloc} />
              </EventLocationAddress>
            </EventLocation>
          </EventLocationWrapper>
        )}
      </Container>
    );
  }

  return null;
});

export default EventCard;

import React, { memo } from 'react';
import moment from 'moment';
import { isEmpty, every } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';

// hooks
import useResourceFiles from 'hooks/useResourceFiles';

// services
import { IEventData } from 'services/events';

// i18n
import T from 'components/T';
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';
import messages from 'containers/ProjectsShowPage/messages';

// utils
import { pastPresentOrFuture, getIsoDate } from 'utils/dateUtils';

// style
import styled, { useTheme } from 'styled-components';
import { media, colors, fontSizes, defaultCardStyle } from 'utils/styleUtils';
import { transparentize } from 'polished';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  width: 100%;
  padding: 30px;
  margin: 20px auto;
  display: flex;
  flex-direction: row;
  ${defaultCardStyle};
  box-shadow: none;
  border: solid 1px #ccc;

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    padding: 25px;
  `}
`;

const EventDateInfo = styled.div`
  flex: 0 0 80px;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    width: 100%;
    flex: 1 1 auto;
    order: 1;
  `}
`;

const EventDates = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: #fff;
  background: ${transparentize(0.92, colors.label)};
  border: solid 1px ${transparentize(0.6, colors.label)};
  border-bottom: none;

  &.past {
    background: ${colors.grey};
  }
`;

const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EventMonth = styled.div`
  color: ${colors.label};
  font-size: 14px;
  line-height: normal;
  font-weight: 500;
  text-transform: uppercase;
`;

const EventDay = styled.div`
  color: ${colors.label};
  font-size: 18px;
  line-height: normal;
  font-weight: 400;
`;

const EventDatesSeparator = styled.div`
  color: ${colors.label};
  font-size: 16px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
  padding-top: 0px;
  padding-bottom: 1px;
`;

const EventYear = styled.div`
  color: #fff;
  font-size: 16px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: ${colors.label};

  &.past {
    background: #555;
  }
`;

const EventInformation = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 30px;

  ${media.smallerThanMaxTablet`
    order: 3;
    border: none;
    margin: 0px;
    margin-top: 20px;
  `}
`;

const EventHeaderTime = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  margin-bottom: 4px;
`;

const EventTitle = styled.h3`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: normal;
  padding: 0;
  margin: 0;
  margin-bottom: 20px;
`;

const EventDescription = styled.div``;

const EventLocationWrapper = styled.div`
  width: 300px;
  flex: 0 0 300px;
  padding: 20px;
  display: flex;
  align-items: center;
  border-left: 1px solid ${colors.separation};
  margin-left: 60px;

  &.past {
    opacity: 0.6;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
    flex: 1;
    order: 2;
    align-items: left;
    padding: 0;
    margin: 0;
    margin-top: 30px;
    margin-bottom: 15px;
    border: none;
  `}
`;

const EventLocation = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 20px;
  margin-right: 10px;

  ${media.smallerThanMaxTablet`
    margin: 0;
  `}
`;

const MapIcon = styled(Icon)`
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  fill: ${colors.label};
  margin-right: 6px;
`;

const EventLocationAddress = styled.div`
  color: ${(props: any) => props.theme.colorText};
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

const EventCard = memo<Props & InjectedIntlProps>(
  ({ event, className, intl: { formatMessage } }) => {
    const eventFiles = useResourceFiles({
      resourceType: 'event',
      resourceId: event.id,
    });
    const theme: any = useTheme();

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
      const isMultiDayEvent = startAtIsoDate !== endAtIsoDate;
      const eventStatus = pastPresentOrFuture([
        event.attributes.start_at,
        event.attributes.end_at,
      ]);
      const hasLocation = !every(event.attributes.location_multiloc, isEmpty);

      return (
        <Container className={`${className} ${eventStatus}`}>
          <EventDateInfo>
            <EventDates className={eventStatus}>
              <EventDate>
                <EventMonth>{startAtMonth}</EventMonth>
                <EventDay>{startAtDay}</EventDay>
              </EventDate>

              {isMultiDayEvent && (
                <>
                  <EventDatesSeparator>-</EventDatesSeparator>
                  <EventDate>
                    <EventMonth>{endAtMonth}</EventMonth>
                    <EventDay>{endAtDay}</EventDay>
                  </EventDate>
                </>
              )}
            </EventDates>

            <EventYear className={eventStatus}>
              <span>{startAtYear}</span>
            </EventYear>
          </EventDateInfo>

          <EventInformation className={eventStatus}>
            <EventHeaderTime>
              {isMultiDayEvent ? (
                <>
                  {startAtMoment.format('LLL')} - {endAtMoment.format('LLL')}
                </>
              ) : (
                <>
                  {startAtMoment.format('LL')} {startAtMoment.format('LT')} →{' '}
                  {endAtMoment.format('LT')}
                </>
              )}
            </EventHeaderTime>

            <EventTitle>
              <T value={event.attributes.title_multiloc} />
            </EventTitle>

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

          {hasLocation && (
            <EventLocationWrapper className={eventStatus}>
              <EventLocation>
                <MapIcon
                  title={formatMessage(messages.location)}
                  name="mapmarker"
                />
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
  }
);

const EventWithHoC = injectIntl(EventCard);

export default EventWithHoC;

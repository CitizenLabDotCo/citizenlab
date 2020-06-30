import React from 'react';
import moment from 'moment';
import { isEmpty, every } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';

// services
import { IEventData } from 'services/events';

// i18n
import T from 'components/T';
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// utils
import { pastPresentOrFuture, getIsoDate } from 'utils/dateUtils';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  width: 100%;
  padding: 30px;
  margin: 20px auto;
  display: flex;
  flex-direction: row;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: #fff;
  border: solid 1px ${colors.separation};

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
  padding-top: 15px;
  padding-bottom: 15px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: #DF3300;

  &.past {
    background: ${colors.grey};
  }
`;

const EventDate = styled.div`
  color: #fff;
  font-size: ${fontSizes.xl}px;
  line-height: 25px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EventDatesSeparator = styled.div`
  color: #fff;
  font-size: ${fontSizes.xl}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
  padding-top: 5px;
  padding-bottom: 5px;
`;

const EventYear = styled.div`
  color: #fff;
  font-size: ${fontSizes.large}px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: #373737;

  &.past {
    background: #555;
  }
`;

const EventInformation = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 40px;

  ${media.smallerThanMaxTablet`
    order: 3;
    border: none;
    margin: 0px;
    margin-top: 20px;
  `}
`;

const EventTime = styled.div`
  color: #666;
  font-size: ${fontSizes.medium}px;
  font-weight: 300;
  line-height: normal;
  margin-bottom: 4px;
`;

const EventTitle = styled.h3`
  color: ${colors.text};
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

interface Props extends InputProps {
  eventFiles: GetResourceFilesChildProps;
}

interface State {}

class Event extends React.PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { event, eventFiles, className, intl: { formatMessage } } = this.props;

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
      const isMultiDayEvent = (startAtIsoDate !== endAtIsoDate);
      const startAtTime = (isMultiDayEvent ? startAtMoment.format('D MMM LT') : startAtMoment.format('LT'));
      const endAtTime = (isMultiDayEvent ? endAtMoment.format('D MMM LT') : endAtMoment.format('LT'));
      const eventStatus = pastPresentOrFuture([event.attributes.start_at, event.attributes.end_at]);
      const hasLocation = !every(event.attributes.location_multiloc, isEmpty);

      return (
        <Container className={`${className} ${eventStatus}`}>
          <EventDateInfo>
            <EventDates className={eventStatus}>
              <EventDate>
                <span>{startAtDay}</span>
                <span>{startAtMonth}</span>
              </EventDate>

              {isMultiDayEvent && (
                <>
                  <EventDatesSeparator>
                    -
                  </EventDatesSeparator>
                  <EventDate>
                    <span>{endAtDay}</span>
                    <span>{endAtMonth}</span>
                  </EventDate>
                </>
              )}
            </EventDates>

            <EventYear className={eventStatus}>
              <span>{startAtYear}</span>
            </EventYear>
          </EventDateInfo>

          <EventInformation className={eventStatus}>
            <EventTime>
              {startAtTime} - {endAtTime}
            </EventTime>

            <EventTitle>
              <T value={event.attributes.title_multiloc} />
            </EventTitle>

            <EventDescription>
              <QuillEditedContent>
                <T value={event.attributes.description_multiloc} supportHtml={true} />
              </QuillEditedContent>
            </EventDescription>

            {!isNilOrError(eventFiles) && eventFiles.length > 0 &&
              <FileAttachments files={eventFiles} />
            }
          </EventInformation>

          {hasLocation &&
            <EventLocationWrapper className={eventStatus}>
              <EventLocation>
                <MapIcon title={formatMessage(messages.location)} name="mapmarker" />
                <EventLocationAddress>
                  <T value={event.attributes.location_multiloc} />
                </EventLocationAddress>
              </EventLocation>
            </EventLocationWrapper>
          }
        </Container>
      );
    }

    return null;
  }
}

const EventWithIntl = injectIntl(Event);

export default (inputProps: InputProps) => (
  <GetResourceFiles resourceType="event" resourceId={inputProps.event.id}>
    {eventFiles => <EventWithIntl eventFiles={eventFiles} {...inputProps} />}
  </GetResourceFiles>
);

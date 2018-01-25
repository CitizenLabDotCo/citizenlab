import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import Icon from 'components/UI/Icon';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { eventStream, IEvent } from 'services/events';

// i18n
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
// import { media } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

const Container = styled.div`
  width: 100%;
  margin: 12px auto;
  padding: 10px;
  display: flex;
  flex-direction: row;
  border-radius: 5px;
  border: solid 1px #e0e0e0;
  background: #fff;
`;

const EventDateInfo = styled.div`
  width: 20%;
  display: flex;
  flex-direction: column;
`;

const EventDates = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 5px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: #f64a00;
`;

const EventDate = styled.div`
  color: #fff;
  font-size: 25px;
  line-height: 30px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EventYear = styled.div`
  color: #ffffff;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background: #373737;
`;

const EventInformation = styled.div`
  display: flex;
  flex-direction: column;
  /* align-items: center;
  justify-content: center; */
  padding: 5px 20px;
  border-right: 1px solid #ccc;
`;

const EventTime = styled.div`
  color: #939393;
  font-size: 16px;
  font-weight: 300;
`;

const EventTitle = styled.div`
  color: #333;
  font-size: 20px;
  line-height: 23px;
  margin-top: 12px;
  font-weight: 500;
`;

const EventDescription = styled.div`
  color: #939393;
  font-size: 16px;
  font-weight: 300;
  line-height: 21px;
  margin-top: 15px;
`;

const EventLocation = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EventAddress = styled.div`
  color: #939393;
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
  display: flex;
  align-items: center;
`;

const MapIcon = styled(Icon)`
  height: 25px;
  fill: #939393;
  margin-right: 10px;
`;

type Props = {
  eventId: string;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  event: IEvent | null;
};

export default class Event extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      locale: null,
      currentTenant: null,
      event: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { eventId } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const event$ = eventStream(eventId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        event$
      ).subscribe(([locale, currentTenant, event]) => {
        this.setState({ locale, currentTenant, event });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { locale, currentTenant, event } = this.state;

    if (locale && currentTenant && event) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const eventTitle = getLocalized(event.data.attributes.title_multiloc, locale, currentTenantLocales);
      const eventDescription = getLocalized(event.data.attributes.description_multiloc, locale, currentTenantLocales);
      const eventLocation = getLocalized(event.data.attributes.location_multiloc, locale, currentTenantLocales);
      const startAtMoment = moment(event.data.attributes.start_at);
      const endAtMoment = moment(event.data.attributes.end_at);
      const startAtTime = startAtMoment.format('HH:mm');
      const endAtTime = endAtMoment.format('HH:mm');
      const startAtDay = startAtMoment.format('DD');
      const endAtDay = endAtMoment.format('DD');
      const startAtMonth = startAtMoment.format('MMM');
      const endAtMonth = endAtMoment.format('MMM');
      const startAtYear = startAtMoment.format('YYYY');
      // const endAtYear = endAtMoment.format('YYYY');
      const isMultiDayEvent = (startAtDay !== endAtDay);

      return (
        <Container className={className}>
          <EventDateInfo>
            <EventDates>
              <EventDate>
                <span>{startAtDay}</span>
                <span>{startAtMonth}</span>
              </EventDate>

              {isMultiDayEvent && (
                <>
                  <span>-</span>
                  <EventDate>
                    <span>{endAtDay}</span>
                    <span>{endAtMonth}</span>
                  </EventDate>
                </>
              )}
            </EventDates>

            <EventYear>
              <span>{startAtYear}</span>
            </EventYear>
          </EventDateInfo>

          <EventInformation>
            <EventTime>
              {startAtTime} - {endAtTime}
            </EventTime>

            <EventTitle>
              {eventTitle}
            </EventTitle>

            <EventDescription>
              <span dangerouslySetInnerHTML={{ __html: eventDescription }} />
            </EventDescription>
          </EventInformation>

          <EventLocation>
            <EventAddress>
              <MapIcon name="mapmarker" />
              <span>{eventLocation}</span>
            </EventAddress>
          </EventLocation>
        </Container>
      );
    }

    return null;
  }
}

import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import ContentContainer from 'components/ContentContainer';

// services
import { localeStream, updateLocale } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { eventStream, IEvent } from 'services/events';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';

// style
import styled, { css } from 'styled-components';
import { transparentize, lighten, darken } from 'polished';
import { media } from 'utils/styleUtils';
import { Grid } from 'semantic-ui-react';

// utils
import { stripHtml } from 'utils/textUtils';

const Container = styled.div`
  /* opacity: ${(props: any) => props.event === 'past' ? '0.7' : 'inherit'}; */
  width: 100%;
  min-height: 166px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin: 12px auto !important;
  padding: 10px;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #eaeaea;
  
  /*
  ${media.phone`
    width: 90%;
  `}
  
  ${media.tablet`
    width: 50%;
  `}
  */
`;

const EventYear = styled.div`
  color: #ffffff;
  font-size: 16px;
  border-radius: 5px;
  background-color: #373737;
  position: absolute;
  bottom: 0;
  padding: 5px;
  width: 100%;
  display: table-cell;
  margin-left: -100%;
`;

const EventDate: any = styled.div`
  border-radius: 5px;
  /* background-color: ${(props: any) => (props.event === 'current' || props.event === 'coming' ? '#f64a00' : '#cfcfcf')}; */
  background: #f64a00;
  height: ${(props: any) => props.start === props.end ? '130px' : '200px'};
  font-size: 25px;
  font-weight: bold;
  line-height: 1.08;
  color: #ffffff;
  text-align: center;
  width: 20%;
  position: relative;
  display: table;
`;

const EventDateInner = styled.div`
  display: table-cell;
  vertical-align: middle;
`;

const TimeLabel = styled.span`
  display: inline-block;
`;

const EventHeader = styled.div`
  font-size: 16px;
  color: #939393;
`;

const EventTitle = styled.div`
  font-size: 20px;
  margin-top: 10px;
  font-weight: 600;
  color: #141414;
`;

const EventDescription = styled.div`
  font-size: 16px;
  color: #939393;
  margin-top: 15px;
`;

const EventInformationColumn = styled.div`
  border-right: 3px solid #eaeaea;
  padding: 5px 20px;
  width: 50%;
  
   ${media.phone`
    width: 80%;
    border-right: none;
  `}
`;

const EventInformation = styled.div``;

const EventAddress = styled.div`
  font-size: 16px;
  color: #939393;
`;

const EventLocation = styled.div`
  padding: 5px 0 0 15px;
  width: 30%;
  
  ${media.phone`
    width: 60%;
    margin: auto;
  `}
`;

type Props = {
  eventId: string;
};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  event: IEvent | null;
};

export default class Event extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
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
      const startAtMonth = startAtMoment.format('MM');
      const endAtMonth = endAtMoment.format('MM');
      const startAtYear = startAtMoment.format('YYYY');
      const endAtYear = endAtMoment.format('YYYY');

      return (
        <Container className={className}>
          <EventDate start={startAtDay} end={endAtDay}>
            <EventDateInner>
              {startAtDay}<br />{startAtMonth}
              {(startAtDay !== endAtDay) && <div>-<br />{endAtDay}<br />{endAtMonth}</div>}
            </EventDateInner>
            <EventYear>{startAtYear}</EventYear>
          </EventDate>

          <EventInformationColumn>
            <EventInformation>
              <EventHeader>
                <TimeLabel>{startAtTime} - {endAtTime}</TimeLabel>
              </EventHeader>

              <EventTitle>
                {eventTitle}
              </EventTitle>

              <EventDescription>
                <span dangerouslySetInnerHTML={{ __html: eventDescription }} />
              </EventDescription>
            </EventInformation>
          </EventInformationColumn>

          <EventLocation>
            <Grid>
              <Grid.Row>
                <Grid.Column width={4}>
                  {/* <Image src={locationIcon} /> */}
                </Grid.Column>
                <Grid.Column
                  width={12}
                  style={{
                    padding: '0 10px 0 0 !important',
                  }}
                >
                  <EventAddress>
                    {eventLocation}
                  </EventAddress>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </EventLocation>
        </Container>
      );
    }

    return null;
  }
}

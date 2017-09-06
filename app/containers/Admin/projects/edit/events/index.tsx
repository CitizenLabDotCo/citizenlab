// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import styled from 'styled-components';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import messages from './messages';
import * as _ from 'lodash';

// Services
import { projectStream } from 'services/projects';
import { eventsStream, IEventData, deleteEvent } from 'services/events';

// Components
import { Link } from 'react-router';
import T from 'containers/T';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import buttonMixin from 'components/admin/StyleMixins/buttonMixin';

// Utils
import subscribedComponent from 'utils/subscriptionsDecorator';

// Styles
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddButton = styled(Link)`
  ${buttonMixin('#EF0071', '#EF0071')}
  color: #fff;
  align-self: flex-end;

  &:hover,
  &:focus {
    color: #fff;
  }
`;

const EventsTable = styled.table`
  width: 100%;

  th {
    font-weight: normal;
    text-align: left;
    padding: .5rem;
  }

  td {
    border-bottom: 1px solid #eaeaea;
    border-top: 1px solid #eaeaea;
    padding: 2rem .5rem;
  }

  h1 {
    font-weight: normal;
    margin-bottom: 0;
  }
`;

const OrderLabel = styled.div`
  border-radius: 50%;
  color: white;
  height: 3rem;
  line-height: 3rem;
  text-align: center;
  width: 3rem;

  &.current {
    background: #32B67A;
  }

  &.past {
    background: #E5E5E5;
  }

  &.future {
    background: #636363;
  }
`;

const DeleteButton = styled.button`
  ${buttonMixin()}
`;

const EditButton = styled(Link)`
  ${buttonMixin('#e5e5e5', '#cccccc')}
  color: #6B6B6B;

  &:hover,
  &:focus: {
    color: #6B6B6B;
  }
`;

// Component typing
type Props = {
  intl: ReactIntl.InjectedIntl,
  params: {
    slug: string | null,
  },
};

type State = {
  events: IEventData[],
  loading: boolean,
};

@subscribedComponent
class AdminProjectTimelineIndex extends React.Component<Props, State> {
  subscription: Rx.Subscription;
  constructor () {
    super();

    this.state = {
      events: [],
      loading: false,
    };
  }

  componentDidMount () {
    this.setState({ loading: true });
    this.subscription = projectStream(this.props.params.slug).observable
    .switchMap((project) => {
      return eventsStream(project.data.id).observable.map((events) => (events.data));
    })
    .subscribe((events) => {
      this.setState({ events, loading: false });
    });
  }

  createDeleteClickHandler = (eventId) => {
    return (event) => {
      event.preventDefault();
      if (window.confirm(this.props.intl.formatMessage(messages.deleteConfirmationModal))) {
        deleteEvent(eventId).then((response) => {
          this.setState({ events: _.reject(this.state.events, { id: eventId }) });
        });
      }
    };
  }

  eventTiming = ({ start_at, end_at }): 'past' | 'current' | 'future' => {
    const start = new Date(start_at);
    const end = new Date(end_at);
    const now = new Date();

    if (end < now) {
      return 'past';
    } else if (start > now) {
      return 'future';
    } else {
      return 'current';
    }
  }

  render() {
    const { events, loading } = this.state;
    const { intl: { formatDate, formatTime }, params: { slug } } = this.props;

    return (
      <ListWrapper>
        <AddButton to={`/admin/projects/${slug}/events/new`}><FormattedMessage {...messages.addEventButton} /></AddButton>

        {!loading && events.length > 0 &&
          <EventsTable>
            <thead>
              <tr>
                <th><FormattedMessage {...messages.titleColumnHeader} /></th>
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={event.id}>
                  <td>
                    <h1><T value={event.attributes.title_multiloc} /></h1>
                    <p><T value={event.attributes.location_multiloc} /></p>
                    <p>
                      {`${formatDate(event.attributes.start_at)} ${formatTime(event.attributes.start_at)}`}
                      &nbsp;-&nbsp;
                      {`${formatDate(event.attributes.end_at)} ${formatTime(event.attributes.end_at)}`}</p>
                  </td>
                  <td>
                    <DeleteButton onClick={this.createDeleteClickHandler(event.id)}>
                      <Icon name="delete" />
                      <FormattedMessage {...messages.deleteButtonLabel} />
                    </DeleteButton>
                  </td>
                  <td>
                    <EditButton to={`/admin/projects/${slug}/events/${event.id}`}>
                      <Icon name="edit" />
                      <FormattedMessage {...messages.editButtonLabel} />
                    </EditButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </EventsTable>
        }
      </ListWrapper>
    );
  }
}

export default injectIntl(AdminProjectTimelineIndex);

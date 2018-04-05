// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import styled from 'styled-components';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import * as _ from 'lodash';
import * as moment from 'moment';

// Services
import { projectBySlugStream } from 'services/projects';
import { eventsStream, IEventData, deleteEvent } from 'services/events';

// Components
import T from 'components/T';
import Button from 'components/UI/Button';
import { List, Row, HeadRow } from 'components/admin/ResourceList';

// Utils
import unsubscribe from 'utils/unsubscribe';

// Styles
const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddButton = styled(Button)`
  align-self: flex-start;
`;

const StyledList = styled(List)`
  margin-top: 30px;
`;

type Props = {
  params: {
    slug: string | null,
  }
};

type State = {
  events: IEventData[],
  loading: boolean,
};

class AdminProjectTimelineIndex extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Rx.Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      events: [],
      loading: false,
    };
  }

  componentDidMount () {
    this.setState({ loading: true });

    if (_.isString(this.props.params.slug)) {
      this.subscription = projectBySlugStream(this.props.params.slug).observable.switchMap((project) => {
        return eventsStream(project.data.id).observable.map((events) => (events.data));
      }).subscribe((events) => {
        this.setState({ events, loading: false });
      });
    }
  }

  componentWillUnmount() {
    unsubscribe(this.subscription);
  }

  createDeleteClickHandler = (eventId) => {
    return (event) => {
      event.preventDefault();
      if (window.confirm(this.props.intl.formatMessage(messages.deleteConfirmationModal))) {
        deleteEvent(eventId).then(() => {
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
    const { slug } = this.props.params;

    return (
      <ListWrapper className="e2e-projects-events">
        <AddButton style="cl-blue" icon="plus-circle" circularCorners={false} linkTo={`/admin/projects/${slug}/events/new`}>
          <FormattedMessage {...messages.addEventButton} />
        </AddButton>

        {!loading && events.length > 0 &&
          <StyledList>
            <HeadRow>
              <div className="expand"><FormattedMessage {...messages.titleColumnHeader} /></div>
            </HeadRow>
            {events.map((event) => {
              const startAt = moment(event.attributes.start_at).format('LLL');
              const endAt = moment(event.attributes.end_at).format('LLL');

              return (
                <Row key={event.id}>
                  <div className="expand">
                    <h1>
                      <T value={event.attributes.title_multiloc} />
                    </h1>
                    <p>
                      <T value={event.attributes.location_multiloc} />
                    </p>
                    <p>
                      {startAt}  →  {endAt}
                    </p>
                  </div>
                  <Button style="text" icon="delete" onClick={this.createDeleteClickHandler(event.id)}>
                    <FormattedMessage {...messages.deleteButtonLabel} />
                  </Button>
                  <Button style="secondary" icon="edit" linkTo={`/admin/projects/${slug}/events/${event.id}`}>
                    <FormattedMessage {...messages.editButtonLabel} />
                  </Button>
                </Row>
              );
            })}
          </StyledList>
        }
      </ListWrapper>
    );
  }
}

export default injectIntl(AdminProjectTimelineIndex);

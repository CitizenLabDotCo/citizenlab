// Libraries
import React from 'react';
import styled from 'styled-components';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { isNilOrError } from 'utils/helperUtils';
import * as moment from 'moment';
import { withRouter, WithRouterProps } from 'react-router';

// Services
import { deleteEvent } from 'services/events';

// Resources
import GetEvents, { GetEventsChildProps } from 'resources/GetEvents';

// Components
import T from 'components/T';
import Button from 'components/UI/Button';
import { List, Row, HeadRow } from 'components/admin/ResourceList';

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

interface InputProps {}

interface DataProps {
  events: GetEventsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class AdminProjectEventsIndex extends React.PureComponent<Props & WithRouterProps & InjectedIntlProps, State> {
  createDeleteClickHandler = (eventId: string) => (event: React.FormEvent<any>) => {
    event.preventDefault();

    if (window.confirm(this.props.intl.formatMessage(messages.deleteConfirmationModal))) {
      deleteEvent(eventId);
    }
  }

  render() {
    const { events } = this.props;
    const { projectId } = this.props.params;

    return (
      <ListWrapper className="e2e-projects-events">
        <AddButton style="cl-blue" icon="plus-circle" circularCorners={false} linkTo={`/admin/projects/${projectId}/events/new`}>
          <FormattedMessage {...messages.addEventButton} />
        </AddButton>

        {!isNilOrError(events) && events.length > 0 &&
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
                  <Button style="secondary" icon="edit" linkTo={`/admin/projects/${projectId}/events/${event.id}`}>
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

export default withRouter(injectIntl((inputProps: InputProps & WithRouterProps & InjectedIntlProps) => (
  <GetEvents projectId={inputProps.params.projectId}>
    {events => <AdminProjectEventsIndex {...inputProps} events={events} />}
  </GetEvents>
)));

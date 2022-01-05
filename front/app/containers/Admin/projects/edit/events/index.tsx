// libraries
import React from 'react';
import styled from 'styled-components';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { deleteEvent } from 'services/events';

// hooks
import useEvents from 'hooks/useEvents';

// components
import T from 'components/T';
import Button from 'components/UI/Button';
import { List, Row, HeadRow } from 'components/admin/ResourceList';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

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

const AdminProjectEventsIndex = ({
  intl,
  params,
}: WithRouterProps & InjectedIntlProps) => {
  const { projectId } = params;
  const { events } = useEvents({
    projectIds: [projectId],
    pageSize: 1000,
  });

  const createDeleteClickHandler =
    (eventId: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();

      if (
        window.confirm(intl.formatMessage(messages.deleteConfirmationModal))
      ) {
        deleteEvent(eventId);
      }
    };

  return (
    <>
      <SectionTitle>
        <FormattedMessage {...messages.titleEvents} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleEvents} />
      </SectionDescription>
      <ListWrapper className="e2e-projects-events">
        <AddButton
          buttonStyle="cl-blue"
          icon="plus-circle"
          linkTo={`/admin/projects/${projectId}/events/new`}
        >
          <FormattedMessage {...messages.addEventButton} />
        </AddButton>

        {!isNilOrError(events) && events.length > 0 && (
          <StyledList>
            <HeadRow>
              <div className="expand">
                <FormattedMessage {...messages.titleColumnHeader} />
              </div>
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
                      {startAt} → {endAt}
                    </p>
                  </div>
                  <Button
                    buttonStyle="text"
                    icon="delete"
                    onClick={createDeleteClickHandler(event.id)}
                  >
                    <FormattedMessage {...messages.deleteButtonLabel} />
                  </Button>
                  <Button
                    buttonStyle="secondary"
                    icon="edit"
                    linkTo={`/admin/projects/${projectId}/events/${event.id}`}
                  >
                    <FormattedMessage {...messages.editButtonLabel} />
                  </Button>
                </Row>
              );
            })}
          </StyledList>
        )}
      </ListWrapper>
    </>
  );
};

export default withRouter(injectIntl(AdminProjectEventsIndex));

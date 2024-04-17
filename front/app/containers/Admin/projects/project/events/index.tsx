import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import saveAs from 'file-saver';
import moment from 'moment';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import { IEventData } from 'api/events/types';
import useDeleteEvent from 'api/events/useDeleteEvent';
import useEvents from 'api/events/useEvents';
import { exportEventAttendees } from 'api/events/util';

import useLocalize from 'hooks/useLocalize';

import { List, Row, HeadRow } from 'components/admin/ResourceList';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import T from 'components/T';
import Button from 'components/UI/Button';
import Warning from 'components/UI/Warning';

import { injectIntl, FormattedMessage, useIntl } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';

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
}: WithRouterProps & WrappedComponentProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { projectId } = params;
  const { data: events } = useEvents({
    projectIds: [projectId],
    pageSize: 1000,
    sort: 'start_at',
  });

  const { mutate: deleteEvent, isLoading } = useDeleteEvent();

  const createDeleteClickHandler =
    (eventId: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();

      if (
        window.confirm(intl.formatMessage(messages.deleteConfirmationModal))
      ) {
        deleteEvent(eventId);
      }
    };

  const handleAttendeesExport = async (event: IEventData) => {
    try {
      const blob = await requestBlob(
        exportEventAttendees(event.id),
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      saveAs(
        blob,
        `attendees-export-for-${localize(event.attributes.title_multiloc)}.xlsx`
      );
    } catch {
      // Do nothing
    }
  };

  return (
    <Box mb="40px" p="44px">
      <Box bg={colors.white} borderRadius={stylingConsts.borderRadius} p="44px">
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

          <Box maxWidth="600px" mt="24px">
            <Warning>
              <FormattedMessage
                {...messages.eventAttendanceExportText}
                values={{
                  userTabLink: (
                    <a
                      href={formatMessage(messages.usersTabLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FormattedMessage {...messages.usersTabLinkText} />
                    </a>
                  ),
                  supportArticleLink: (
                    <a
                      href={formatMessage(
                        messages.attendanceSupportArticleLink
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FormattedMessage
                        {...messages.attendanceSupportArticleLinkText}
                      />
                    </a>
                  ),
                }}
              />
            </Warning>
          </Box>

          {!isNilOrError(events) && events.data.length > 0 && (
            <StyledList>
              <>
                <HeadRow>
                  <div className="expand">
                    <FormattedMessage {...messages.titleColumnHeader} />
                  </div>
                </HeadRow>
                {events.data.map((event) => {
                  const startAt = moment(event.attributes.start_at).format(
                    'LLL'
                  );
                  const endAt = moment(event.attributes.end_at).format('LLL');

                  return (
                    <Row key={event.id}>
                      <div className="expand">
                        <h1>
                          <T value={event.attributes.title_multiloc} />
                        </h1>
                        <p>{event.attributes.address_1}</p>
                        <p>
                          {startAt} → {endAt}
                        </p>
                      </div>
                      <Button
                        buttonStyle="text"
                        icon="delete"
                        onClick={createDeleteClickHandler(event.id)}
                        processing={isLoading}
                      >
                        <FormattedMessage {...messages.deleteButtonLabel} />
                      </Button>
                      <Button
                        buttonStyle="secondary"
                        disabled={event.attributes.attendees_count === 0}
                        icon="download"
                        onClick={() => handleAttendeesExport(event)}
                      >
                        <FormattedMessage {...messages.exportAttendees} />
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
              </>
            </StyledList>
          )}
        </ListWrapper>
      </Box>
    </Box>
  );
};

export default withRouter(injectIntl(AdminProjectEventsIndex));

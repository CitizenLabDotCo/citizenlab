import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import saveAs from 'file-saver';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IEventData } from 'api/events/types';
import useDeleteEvent from 'api/events/useDeleteEvent';
import useEvents from 'api/events/useEvents';
import { exportEventAttendees } from 'api/events/util';

import useLocalize from 'hooks/useLocalize';

import { List, Row, HeadRow } from 'components/admin/ResourceList';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const AddButton = styled(ButtonWithLink)`
  align-self: flex-start;
`;

const StyledList = styled(List)`
  margin-top: 30px;
`;

const AdminProjectEventsIndex = () => {
  const { projectId } = useParams() as { projectId: string };
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: events } = useEvents({
    projectIds: [projectId],
    pageSize: 1000,
    sort: 'start_at',
  });

  const { mutate: deleteEvent, isLoading } = useDeleteEvent();

  const createDeleteClickHandler =
    (eventId: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();

      if (window.confirm(formatMessage(messages.deleteConfirmationModal))) {
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
            buttonStyle="admin-dark"
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

          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {events && events?.data.length > 0 && (
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
                        <h1>{localize(event.attributes.title_multiloc)}</h1>
                        <p>{event.attributes.address_1}</p>
                        <p>
                          {startAt} → {endAt}
                        </p>
                      </div>
                      <Box>
                        <Title
                          variant="h6"
                          color="primary"
                          fontSize="xl"
                          p="0px"
                          m="0px"
                        >
                          {event.attributes.attendees_count}
                        </Title>
                        <Text m="0px">
                          {event.attributes.attendees_count === 1 ? (
                            <FormattedMessage {...messages.attendee} />
                          ) : (
                            <FormattedMessage {...messages.attendees} />
                          )}
                        </Text>
                      </Box>
                      <ButtonWithLink
                        buttonStyle="text"
                        icon="delete"
                        onClick={createDeleteClickHandler(event.id)}
                        processing={isLoading}
                      >
                        <FormattedMessage {...messages.deleteButtonLabel} />
                      </ButtonWithLink>
                      <ButtonWithLink
                        buttonStyle="secondary-outlined"
                        disabled={event.attributes.attendees_count === 0}
                        icon="download"
                        onClick={() => handleAttendeesExport(event)}
                      >
                        <FormattedMessage {...messages.exportAttendees} />
                      </ButtonWithLink>
                      <ButtonWithLink
                        buttonStyle="secondary-outlined"
                        icon="edit"
                        linkTo={`/admin/projects/${projectId}/events/${event.id}`}
                      >
                        <FormattedMessage {...messages.editButtonLabel} />
                      </ButtonWithLink>
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

export default AdminProjectEventsIndex;

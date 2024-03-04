import React from 'react';

// styles

import { Select, Label } from '@citizenlab/cl2-component-library';
import { memoize } from 'lodash-es';
import styled from 'styled-components';
import { IOption } from 'typings';

// events
import events, {
  StatusChangeModalOpen,
} from 'components/admin/PostManager/events';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { getFullName } from 'utils/textUtils';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IInitiativeAllowedTransitions } from 'api/initiative_allowed_transitions/types';
import useInitiativeAllowedTransitions from 'api/initiative_allowed_transitions/useInitiativeAllowedTransitions';
import {
  IInitiativeStatusData,
  IInitiativeStatuses,
} from 'api/initiative_statuses/types';
import useInitiativeStatuses from 'api/initiative_statuses/useInitiativeStatuses';
import { IInitiativeData } from 'api/initiatives/types';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useUpdateInitiative from 'api/initiatives/useUpdateInitiative';
import useAuthUser from 'api/me/useAuthUser';
import { IUsers } from 'api/users/types';
import useUsers from 'api/users/useUsers';

import useLocalize from 'hooks/useLocalize';

import tracks from '../../../tracks';
import messages from '../messages';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface Props {
  initiativeId: string;
  className?: string;
}

const FeedbackSettings = ({ initiativeId, className }: Props) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: authUser } = useAuthUser();
  const { data: tenant } = useAppConfiguration();
  const { data: statuses } = useInitiativeStatuses();
  const { data: prospectAssignees } = useUsers({ can_admin: true });
  const { data: allowedTransitions } =
    useInitiativeAllowedTransitions(initiativeId);
  const { mutate: updateInitiative } = useUpdateInitiative();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  if (
    !initiative ||
    !authUser ||
    !tenant ||
    !statuses ||
    !allowedTransitions ||
    !prospectAssignees
  ) {
    return null;
  }

  const getStatusOptions = (
    statuses: IInitiativeStatusData[],
    allowedTransitions: IInitiativeAllowedTransitions
  ): IOption[] => {
    return statuses.map((status) => ({
      value: status.id,
      label: localize(status.attributes.title_multiloc),
      disabled: allowedTransitions.data.attributes[status.id] === undefined,
    }));
  };

  const getInitiativeStatusOption = memoize(
    (initiative: IInitiativeData, statuses: IInitiativeStatuses) => {
      if (
        initiative.relationships.initiative_status &&
        initiative.relationships.initiative_status.data
      ) {
        const initiativeStatus = statuses.data.find(
          (status) =>
            status.id === initiative.relationships.initiative_status?.data?.id
        );
        if (initiativeStatus) {
          return {
            value: initiativeStatus.id,
            label: localize(initiativeStatus.attributes.title_multiloc),
            color: initiativeStatus.attributes.color,
          };
        }

        return null;
      }

      return null;
    },
    (initiative: IInitiativeData, statuses: IInitiativeStatuses) =>
      JSON.stringify({
        initiativeId: initiative.relationships.initiative_status?.data?.id,
        statusesId: statuses.data.map((status) => status.id),
      })
  );

  const getAssigneeOptions = memoize((prospectAssignees: IUsers) => {
    const assigneeOptions = prospectAssignees.data.map((assignee) => ({
      value: assignee.id,
      label: getFullName(assignee),
    }));
    assigneeOptions.push({
      value: 'unassigned',
      label: formatMessage(messages.noOne),
    });
    return assigneeOptions;
  });

  const onStatusChange = (statusOption: IOption) => {
    const statusId = statusOption.value;
    eventEmitter.emit<StatusChangeModalOpen>(events.statusChangeModalOpen, {
      initiativeId,
      newStatusId: statusId,
      feedbackRequired:
        allowedTransitions.data.attributes[statusId]?.feedback_required,
    });

    trackEventByName(tracks.initiativeStatusChange, {
      tenant: tenant.data.id,
      location: 'Initiative preview/popup',
      initiative: initiativeId,
      adminAtWork: authUser.data.id,
    });
  };

  const onAssigneeChange = (assigneeOption: IOption | null) => {
    const assigneeId = assigneeOption ? assigneeOption.value : null;

    updateInitiative({
      initiativeId,
      requestBody: {
        assignee_id: assigneeId,
      },
    });

    trackEventByName(tracks.changeInitiativeAssignment, {
      tenant: tenant.data.id,
      location: 'Initiative preview',
      initiative: initiativeId,
      assignee: assigneeId,
      adminAtWork: authUser.data.id,
    });
  };

  const statusOptions = getStatusOptions(statuses.data, allowedTransitions);
  const initiativeStatusOption = getInitiativeStatusOption(
    initiative.data,
    statuses
  );
  const assigneeOptions = getAssigneeOptions(prospectAssignees);
  const initiativeAssigneeOption =
    initiative.data.relationships.assignee.data?.id ?? 'unassigned';

  return (
    <Container className={`${className} e2e-initiative-settings`}>
      <StyledLabel
        value={<FormattedMessage {...messages.currentStatus} />}
        htmlFor="initiative-preview-select-status"
      />
      <Select
        id="initiative-preview-select-status"
        options={statusOptions}
        onChange={onStatusChange}
        value={initiativeStatusOption}
      />
      <StyledLabel
        value={<FormattedMessage {...messages.assignee} />}
        htmlFor="initiative-preview-select-assignee"
      />
      <Select
        id="initiative-preview-select-assignee"
        options={assigneeOptions}
        onChange={onAssigneeChange}
        value={initiativeAssigneeOption}
      />
    </Container>
  );
};

export default FeedbackSettings;

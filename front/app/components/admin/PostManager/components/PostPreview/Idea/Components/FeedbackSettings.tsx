import React from 'react';

import { Select, Label } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { IOption } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IIdeaStatuses } from 'api/idea_statuses/types';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdea } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import useUsers from 'api/users/useUsers';

import useLocalize from 'hooks/useLocalize';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { getFullName } from 'utils/textUtils';

import tracks from '../../../../tracks';
import { getIdeaOfficialFeedbackModalEventName } from '../../../IdeaOfficialFeedbackModal';
import messages from '../../messages';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface Props {
  projectId: string;
  ideaId: string;
  className?: string;
}

const FeedbackSettings = ({ projectId, ideaId, className }: Props) => {
  const { phaseId } = useParams() as { phaseId: string };
  const { data: phase } = usePhase(phaseId);
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { data: appConfig } = useAppConfiguration();
  const { data: statuses } = useIdeaStatuses({
    participation_method:
      phase?.data.attributes.participation_method === 'proposals'
        ? 'proposals'
        : 'ideation',
  });
  const { mutate: updateIdea } = useUpdateIdea();
  const { data: prospectAssignees } = useUsers({
    can_moderate_project: projectId,
  });
  const adminAtWorkId = authUser ? authUser.data.id : null;

  const getIdeaStatusOption = (idea: IIdea, statuses: IIdeaStatuses) => {
    const ideaStatus = statuses.data.find(
      (status) => status.id === idea.data.relationships.idea_status.data?.id
    );

    if (ideaStatus) {
      return {
        value: ideaStatus.id,
        label: localize(ideaStatus.attributes.title_multiloc),
        color: ideaStatus.attributes.color,
      };
    }

    return null;
  };

  const getAssigneeOptions = () => {
    if (prospectAssignees) {
      const assigneeOptions = prospectAssignees.data.map((assignee) => ({
        value: assignee.id,
        label: getFullName(assignee),
      }));
      assigneeOptions.push({
        value: 'unassigned',
        label: formatMessage(messages.noOne),
      });
      return assigneeOptions;
    }

    return [];
  };

  const onStatusChange = (statusOption: IOption) => {
    const tenantId = !isNilOrError(appConfig) && appConfig.data.id;

    updateIdea({
      id: ideaId,
      requestBody: { idea_status_id: statusOption.value },
    });

    trackEventByName(tracks.ideaStatusChange, {
      tenant: tenantId,
      location: 'Idea preview/popup',
      idea: ideaId,
      adminAtWork: adminAtWorkId,
    });

    eventEmitter.emit(getIdeaOfficialFeedbackModalEventName(ideaId));
  };

  const onAssigneeChange = (assigneeOption: IOption | null) => {
    const assigneeId = assigneeOption ? assigneeOption.value : null;
    const tenantId = !isNilOrError(appConfig) && appConfig.data.id;

    updateIdea({
      id: ideaId,
      requestBody: { assignee_id: assigneeId },
    });

    trackEventByName(tracks.changeIdeaAssignment, {
      tenant: tenantId,
      location: 'Idea preview',
      idea: ideaId,
      assignee: assigneeId,
      adminAtWork: adminAtWorkId,
    });
  };

  if (idea && statuses) {
    const statusOptions = statuses.data.map((status) => ({
      value: status.id,
      label: localize(status.attributes.title_multiloc),
      disabled: !status.attributes.can_manually_transition_to,
    }));
    const ideaStatusOption = getIdeaStatusOption(idea, statuses);
    const assigneeOptions = getAssigneeOptions();
    const ideaAssigneeOption =
      idea.data.relationships.assignee?.data?.id || 'unassigned';

    return (
      <Container className={`${className} e2e-idea-settings`}>
        <StyledLabel
          value={<FormattedMessage {...messages.currentStatus} />}
          htmlFor="idea-preview-select-status"
        />
        <Select
          id="idea-preview-select-status"
          options={statusOptions}
          onChange={onStatusChange}
          value={ideaStatusOption}
        />
        <StyledLabel
          value={<FormattedMessage {...messages.assignee} />}
          htmlFor="idea-preview-select-assignee"
        />
        <Select
          id="idea-preview-select-assignee"
          options={assigneeOptions}
          onChange={onAssigneeChange}
          value={ideaAssigneeOption}
        />
      </Container>
    );
  }
  return null;
};

export default FeedbackSettings;

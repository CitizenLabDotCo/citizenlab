import React from 'react';
import { adopt } from 'react-adopt';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IOption } from 'typings';

// styles
import styled from 'styled-components';

// components
import { Select, Label } from '@citizenlab/cl2-component-library';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../../tracks';
import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'api/me/useAuthUser';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import { IIdea } from 'api/ideas/types';
import { IIdeaStatuses } from 'api/idea_statuses/types';
import { getFullName } from 'utils/textUtils';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface DataProps {
  prospectAssignees: GetUsersChildProps;
}

interface InputProps {
  projectId: string;
  ideaId: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

const FeedbackSettings = ({ ideaId, className, prospectAssignees }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { data: appConfig } = useAppConfiguration();
  const { data: statuses } = useIdeaStatuses();
  const { mutate: updateIdea } = useUpdateIdea();
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
    if (!isNilOrError(prospectAssignees.usersList)) {
      const assigneeOptions = prospectAssignees.usersList.map((assignee) => ({
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

const Data = adopt<DataProps, InputProps>({
  prospectAssignees: ({ projectId, render }) => (
    <GetUsers can_moderate_project={projectId}>{render}</GetUsers>
  ),
});

export default (inputProps: InputProps) => {
  return (
    <Data {...inputProps}>
      {(dataProps) => <FeedbackSettings {...inputProps} {...dataProps} />}
    </Data>
  );
};

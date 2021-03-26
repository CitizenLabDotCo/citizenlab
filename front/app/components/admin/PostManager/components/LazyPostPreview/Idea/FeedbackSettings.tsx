import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { get, memoize } from 'lodash-es';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// typings
import { IOption } from 'typings';

// styles
import styled from 'styled-components';

// components
import { Select, Label } from 'cl2-component-library';

// services
import { updateIdea } from 'services/ideas';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import GetIdeaStatuses, {
  GetIdeaStatusesChildProps,
} from 'resources/GetIdeaStatuses';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../../tracks';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
  statuses: GetIdeaStatusesChildProps;
  idea: GetIdeaChildProps;
  prospectAssignees: GetUsersChildProps;
}

interface InputProps {
  ideaId: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

interface PropsWithHoCs extends Props, InjectedLocalized, InjectedIntlProps {}

class FeedbackSettings extends PureComponent<PropsWithHoCs> {
  getStatusOptions = memoize((statuses) => {
    const { localize } = this.props;
    if (!isNilOrError(statuses)) {
      return statuses.map((status) => ({
        value: status.id,
        label: localize(status.attributes.title_multiloc),
      }));
    }

    return [];
  });

  getIdeaStatusOption = memoize(
    (idea: GetIdeaChildProps, statuses) => {
      const { localize } = this.props;
      if (
        !isNilOrError(idea) &&
        idea.relationships.idea_status &&
        idea.relationships.idea_status.data &&
        !isNilOrError(statuses)
      ) {
        const ideaStatus = statuses.find(
          (status) =>
            status.id === get(idea, 'relationships.idea_status.data.id')
        );
        if (ideaStatus) {
          return {
            value: ideaStatus.id,
            label: localize(ideaStatus.attributes.title_multiloc),
            color: ideaStatus.attributes.color,
          };
        }

        return null;
      }

      return null;
    },
    (idea: GetIdeaChildProps, statuses) =>
      JSON.stringify({
        ideaId: isNilOrError(idea)
          ? undefined
          : get(idea, 'relationships.idea_status.data.id'),
        statusesId: isNilOrError(statuses)
          ? undefined
          : statuses.map((status) => status.id),
      })
  );

  getAssigneeOptions = memoize((prospectAssignees) => {
    const {
      intl: { formatMessage },
    } = this.props;
    if (!isNilOrError(prospectAssignees.usersList)) {
      const assigneeOptions = prospectAssignees.usersList.map((assignee) => ({
        value: assignee.id,
        label: `${assignee.attributes.first_name} ${assignee.attributes.last_name}`,
      }));
      assigneeOptions.push({
        value: 'unassigned',
        label: formatMessage(messages.noOne),
      });
      return assigneeOptions;
    }

    return [];
  });

  onStatusChange = (statusOption: IOption) => {
    const { tenant, ideaId, authUser } = this.props;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    updateIdea(this.props.ideaId, {
      idea_status_id: statusOption.value,
    });

    trackEventByName(tracks.ideaStatusChange, {
      tenant: tenantId,
      location: 'Idea preview/popup',
      idea: ideaId,
      adminAtWork: adminAtWorkId,
    });
  };

  onAssigneeChange = (assigneeOption: IOption | null) => {
    const { tenant, ideaId, authUser } = this.props;
    const assigneeId = assigneeOption ? assigneeOption.value : null;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    updateIdea(ideaId, {
      assignee_id: assigneeId,
    });

    trackEventByName(tracks.changeIdeaAssignment, {
      tenant: tenantId,
      location: 'Idea preview',
      idea: ideaId,
      assignee: assigneeId,
      adminAtWork: adminAtWorkId,
    });
  };

  render() {
    const { idea, className, statuses, prospectAssignees } = this.props;

    const statusOptions = this.getStatusOptions(statuses);
    const ideaStatusOption = this.getIdeaStatusOption(idea, statuses);
    const assigneeOptions = this.getAssigneeOptions(prospectAssignees);
    const ideaAssigneeOption = get(
      idea,
      'relationships.assignee.data.id',
      'unassigned'
    );

    if (!isNilOrError(idea)) {
      return (
        <Container className={`${className} e2e-idea-settings`}>
          <StyledLabel
            value={<FormattedMessage {...messages.currentStatus} />}
            htmlFor="idea-preview-select-status"
          />
          <Select
            id="idea-preview-select-status"
            options={statusOptions}
            onChange={this.onStatusChange}
            value={ideaStatusOption}
          />
          <StyledLabel
            value={<FormattedMessage {...messages.assignee} />}
            htmlFor="idea-preview-select-assignee"
          />
          <Select
            id="idea-preview-select-assignee"
            options={assigneeOptions}
            onChange={this.onAssigneeChange}
            value={ideaAssigneeOption}
          />
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
  statuses: <GetIdeaStatuses />,
  prospectAssignees: ({ idea, render }) => (
    <GetUsers canModerateProject={get(idea, 'relationships.project.data.id')}>
      {render}
    </GetUsers>
  ),
});

const FeedbackSettingsWithHOCs = injectIntl(injectLocalize(FeedbackSettings));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <FeedbackSettingsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

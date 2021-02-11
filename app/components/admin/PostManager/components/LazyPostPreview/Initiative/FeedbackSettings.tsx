import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { get, memoize } from 'lodash-es';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from '../messages';

// typings
import { IOption } from 'typings';

// styles
import styled from 'styled-components';

// components
import { Select, Label } from 'cl2-component-library';

// services
import { updateInitiative } from 'services/initiatives';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import GetInitiativeStatuses, {
  GetInitiativeStatusesChildProps,
} from 'resources/GetInitiativeStatuses';
import GetInitiativeAllowedTransitions, {
  GetInitiativeAllowedTransitionsChildProps,
} from 'resources/GetInitiativeAllowedTransitions';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetAppConfiguration, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../../tracks';
import { InjectedIntlProps } from 'react-intl';

// events
import eventEmitter from 'utils/eventEmitter';
import events, {
  StatusChangeModalOpen,
} from 'components/admin/PostManager/events';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
  statuses: GetInitiativeStatusesChildProps;
  initiative: GetInitiativeChildProps;
  prospectAssignees: GetUsersChildProps;
  allowedTransitions: GetInitiativeAllowedTransitionsChildProps;
}

interface InputProps {
  initiativeId: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

interface PropsWithHoCs extends Props, InjectedLocalized, InjectedIntlProps {}

class FeedbackSettings extends PureComponent<PropsWithHoCs> {
  getStatusOptions = (statuses, allowedTransitions) => {
    const { localize } = this.props;
    if (!isNilOrError(statuses)) {
      return statuses.map((status) => ({
        value: status.id,
        label: localize(status.attributes.title_multiloc),
        isDisabled:
          allowedTransitions && allowedTransitions[status.id] === undefined,
      }));
    } else {
      return [];
    }
  };

  getInitiativeStatusOption = memoize(
    (initiative: GetInitiativeChildProps, statuses) => {
      const { localize } = this.props;
      if (
        !isNilOrError(initiative) &&
        initiative.relationships.initiative_status &&
        initiative.relationships.initiative_status.data &&
        !isNilOrError(statuses)
      ) {
        const initiativeStatus = statuses.find(
          (status) =>
            status.id ===
            get(initiative, 'relationships.initiative_status.data.id')
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
    (initiative: GetInitiativeChildProps, statuses) =>
      JSON.stringify({
        initiativeId: isNilOrError(initiative)
          ? undefined
          : get(initiative, 'relationships.initiative_status.data.id'),
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
    const { tenant, initiativeId, authUser } = this.props;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    eventEmitter.emit<StatusChangeModalOpen>(events.statusChangeModalOpen, {
      initiativeId,
      newStatusId: statusOption.value,
    });

    trackEventByName(tracks.initiativeStatusChange, {
      tenant: tenantId,
      location: 'Initiative preview/popup',
      initiative: initiativeId,
      adminAtWork: adminAtWorkId,
    });
  };

  onAssigneeChange = (assigneeOption: IOption | null) => {
    const { tenant, initiativeId, authUser } = this.props;
    const assigneeId = assigneeOption ? assigneeOption.value : null;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    updateInitiative(initiativeId, {
      assignee_id: assigneeId,
    });

    trackEventByName(tracks.changeInitiativeAssignment, {
      tenant: tenantId,
      location: 'Initiative preview',
      initiative: initiativeId,
      assignee: assigneeId,
      adminAtWork: adminAtWorkId,
    });
  };

  render() {
    const {
      initiative,
      className,
      statuses,
      prospectAssignees,
      allowedTransitions,
    } = this.props;

    const statusOptions = this.getStatusOptions(statuses, allowedTransitions);
    const initiativeStatusOption = this.getInitiativeStatusOption(
      initiative,
      statuses
    );
    const assigneeOptions = this.getAssigneeOptions(prospectAssignees);
    const initiativeAssigneeOption = get(
      initiative,
      'relationships.assignee.data.id',
      'unassigned'
    );

    if (!isNilOrError(initiative)) {
      return (
        <Container className={`${className} e2e-initiative-settings`}>
          <StyledLabel
            value={<FormattedMessage {...messages.currentStatus} />}
            htmlFor="initiative-preview-select-status"
          />
          <Select
            id="initiative-preview-select-status"
            options={statusOptions}
            onChange={this.onStatusChange}
            value={initiativeStatusOption}
          />
          <StyledLabel
            value={<FormattedMessage {...messages.assignee} />}
            htmlFor="initiative-preview-select-assignee"
          />
          <Select
            id="initiative-preview-select-assignee"
            options={assigneeOptions}
            onChange={this.onAssigneeChange}
            value={initiativeAssigneeOption}
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
  initiative: ({ initiativeId, render }) => (
    <GetInitiative id={initiativeId}>{render}</GetInitiative>
  ),
  statuses: <GetInitiativeStatuses />,
  prospectAssignees: <GetUsers canAdmin />,
  allowedTransitions: ({ initiativeId, render }) => (
    <GetInitiativeAllowedTransitions id={initiativeId}>
      {render}
    </GetInitiativeAllowedTransitions>
  ),
});

const FeedbackSettingsWithHOCs = injectIntl(injectLocalize(FeedbackSettings));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <FeedbackSettingsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

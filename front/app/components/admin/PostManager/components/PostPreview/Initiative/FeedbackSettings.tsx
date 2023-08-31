import React from 'react';
import { adopt } from 'react-adopt';
import { memoize } from 'lodash-es';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from '../messages';

// typings
import { IOption } from 'typings';
import { IInitiativeData } from 'api/initiatives/types';

// styles
import styled from 'styled-components';

// components
import { Select, Label } from '@citizenlab/cl2-component-library';

// resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import GetInitiativeStatuses, {
  GetInitiativeStatusesChildProps,
} from 'resources/GetInitiativeStatuses';
import GetInitiativeAllowedTransitions, {
  GetInitiativeAllowedTransitionsChildProps,
} from 'resources/GetInitiativeAllowedTransitions';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../../tracks';
import { WrappedComponentProps } from 'react-intl';

// events
import eventEmitter from 'utils/eventEmitter';
import events, {
  StatusChangeModalOpen,
} from 'components/admin/PostManager/events';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useUpdateInitiative from 'api/initiatives/useUpdateInitiative';
import { getFullName } from 'utils/textUtils';

const StyledLabel = styled(Label)`
  margin-top: 20px;
`;

const Container = styled.div``;

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
  statuses: GetInitiativeStatusesChildProps;
  prospectAssignees: GetUsersChildProps;
  allowedTransitions: GetInitiativeAllowedTransitionsChildProps;
}

interface InputProps {
  initiativeId: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

const FeedbackSettings = ({
  localize,
  intl: { formatMessage },
  tenant,
  initiativeId,
  authUser,
  className,
  statuses,
  prospectAssignees,
  allowedTransitions,
}: Props & InjectedLocalized & WrappedComponentProps) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const { mutate: updateInitiative } = useUpdateInitiative();

  const getStatusOptions = (
    statuses: GetInitiativeStatusesChildProps,
    allowedTransitions: GetInitiativeAllowedTransitionsChildProps
  ): IOption[] => {
    if (!isNilOrError(statuses)) {
      return statuses.map((status) => ({
        value: status.id,
        label: localize(status.attributes.title_multiloc),
        disabled:
          !!allowedTransitions && allowedTransitions[status.id] === undefined,
      }));
    } else {
      return [];
    }
  };

  const getInitiativeStatusOption = memoize(
    (initiative: IInitiativeData, statuses) => {
      if (
        !isNilOrError(initiative) &&
        initiative.relationships.initiative_status &&
        initiative.relationships.initiative_status.data &&
        !isNilOrError(statuses)
      ) {
        const initiativeStatus = statuses.find(
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
    (initiative: IInitiativeData, statuses) =>
      JSON.stringify({
        initiativeId: isNilOrError(initiative)
          ? undefined
          : initiative.relationships.initiative_status?.data?.id,
        statusesId: isNilOrError(statuses)
          ? undefined
          : statuses.map((status) => status.id),
      })
  );

  const getAssigneeOptions = memoize((prospectAssignees) => {
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
  });

  const onStatusChange = (statusOption: IOption) => {
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    eventEmitter.emit<StatusChangeModalOpen>(events.statusChangeModalOpen, {
      initiativeId,
      newStatusId: statusOption.value,
      feedbackRequired:
        allowedTransitions?.[statusOption.value]?.feedback_required,
    });

    trackEventByName(tracks.initiativeStatusChange, {
      tenant: tenantId,
      location: 'Initiative preview/popup',
      initiative: initiativeId,
      adminAtWork: adminAtWorkId,
    });
  };

  const onAssigneeChange = (assigneeOption: IOption | null) => {
    const assigneeId = assigneeOption ? assigneeOption.value : null;
    const adminAtWorkId = authUser ? authUser.id : null;
    const tenantId = !isNilOrError(tenant) && tenant.id;

    updateInitiative({
      initiativeId,
      requestBody: {
        assignee_id: assigneeId,
      },
    });

    trackEventByName(tracks.changeInitiativeAssignment, {
      tenant: tenantId,
      location: 'Initiative preview',
      initiative: initiativeId,
      assignee: assigneeId,
      adminAtWork: adminAtWorkId,
    });
  };

  if (!initiative) {
    return null;
  }

  const statusOptions = getStatusOptions(statuses, allowedTransitions);
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

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  statuses: <GetInitiativeStatuses />,
  prospectAssignees: <GetUsers can_admin />,
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

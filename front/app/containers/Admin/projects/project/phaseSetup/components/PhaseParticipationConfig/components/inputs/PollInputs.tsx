import React from 'react';

import { Box, IconTooltip, Toggle } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import PhaseActionAccessRow from 'containers/Admin/projects/_shared/components/PhaseActionAccessRow';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import SettingToggleRow from 'components/admin/SettingToggleRow';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../../../../messages';
import configMessages from '../../messages';

interface Props {
  poll_anonymous: boolean | undefined;
  apiErrors: CLErrors | null | undefined;
  togglePollAnonymous: () => void;
  layout?: 'page' | 'panel';
  /** Only set in the panel, where access is edited per action. */
  phaseId?: string;
}

const PollInputs = ({
  poll_anonymous,
  apiErrors,
  togglePollAnonymous,
  layout = 'page',
  phaseId,
}: Props) => {
  const { formatMessage } = useIntl();
  const error = <Error apiErrors={apiErrors && apiErrors.poll_anonymous} />;

  if (layout === 'panel') {
    return (
      <>
        <Box mb="10px">
          <PanelHeading label={formatMessage(configMessages.rulesGroup)} />
        </Box>
        <PanelGroup
          label={formatMessage(configMessages.participantActionsGroup)}
          defaultOpen
        >
          {phaseId && (
            <>
              <PhaseActionAccessRow
                phaseId={phaseId}
                action="taking_poll"
                label={configMessages.takingPollAction}
              />
              <PhaseActionAccessRow
                phaseId={phaseId}
                action="attending_event"
                label={messages.attendingEventAction}
              />
            </>
          )}
        </PanelGroup>
        <PanelGroup
          label={formatMessage(configMessages.moderationGroup)}
          defaultOpen
        >
          <SettingToggleRow
            title={formatMessage(messages.anonymousPolling)}
            description={formatMessage(messages.anonymousPollingTooltip)}
            checked={!!poll_anonymous}
            onChange={togglePollAnonymous}
          />
          {error}
        </PanelGroup>
      </>
    );
  }

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.anonymousPolling} />
        <IconTooltip
          content={<FormattedMessage {...messages.anonymousPollingTooltip} />}
        />
      </SubSectionTitle>

      <Toggle
        checked={poll_anonymous as boolean}
        onChange={togglePollAnonymous}
      />

      {error}
    </SectionField>
  );
};

export default PollInputs;

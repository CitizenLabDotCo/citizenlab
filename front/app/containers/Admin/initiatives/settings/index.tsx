import React, { useState, useMemo, useEffect } from 'react';
import { isEmpty, isNaN, omit, isEqual } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useNavbarItemEnabled from 'hooks/useNavbarItemEnabled';

// services
import { updateAppConfiguration } from 'services/appConfiguration';
import { toggleProposals } from 'services/navbar';

// components
import {
  SectionTitle,
  SectionDescription,
  Section,
} from 'components/admin/Section';
import Warning from 'components/UI/Warning';
import EnableSwitch from './EnableSwitch';
import VotingThreshold from './VotingThreshold';
import VotingLimit from './VotingLimit';
import ThresholdReachedMessage from './ThresholdReachedMessage';
import EligibilityCriteria from './EligibilityCriteria';
import SubmitButton from './SubmitButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';

// typings
import { Multiloc } from 'typings';

const Container = styled.div``;

export const StyledWarning = styled(Warning)`
  margin-bottom: 7px;
`;

export const StyledSectionDescription = styled(SectionDescription)`
  margin-bottom: 20px;
`;

interface ProposalsSettings {
  days_limit: number;
  eligibility_criteria: Multiloc;
  threshold_reached_message: Multiloc;
  voting_threshold: number;
}

type ProposalssSettingName = keyof ProposalsSettings;

const InitiativesSettingsPage = () => {
  const appConfiguration = useAppConfiguration();
  const proposalsNavbarItemEnabled = useNavbarItemEnabled('proposals');

  const remoteProposalsSettings = useMemo(() => {
    if (
      isNilOrError(appConfiguration) ||
      !appConfiguration.data.attributes.settings.initiatives
    ) {
      return null;
    }

    return omit(appConfiguration.data.attributes.settings.initiatives, [
      'allowed',
      'enabled',
    ]);
  }, [appConfiguration]);

  const [
    localProposalsSettings,
    setLocalProposalsSettings,
  ] = useState<ProposalsSettings | null>(null);

  useEffect(() => {
    setLocalProposalsSettings(remoteProposalsSettings);
  }, [remoteProposalsSettings]);

  const [
    newProposalsNavbarItemEnabled,
    setNewProposalsNavbarItemEnabled,
  ] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isNilOrError(proposalsNavbarItemEnabled)) {
      setNewProposalsNavbarItemEnabled(proposalsNavbarItemEnabled);
    }
  }, [proposalsNavbarItemEnabled]);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (
    isNilOrError(appConfiguration) ||
    isNilOrError(proposalsNavbarItemEnabled) ||
    !remoteProposalsSettings ||
    !localProposalsSettings ||
    newProposalsNavbarItemEnabled === null
  ) {
    return null;
  }

  const validate = () => {
    const tenantLocales =
      appConfiguration.data.attributes.settings.core.locales;
    let validated = false;

    const proposalsSettingsChanged = !isEqual(
      remoteProposalsSettings,
      localProposalsSettings
    );

    const proposalsNavbarItemChanged =
      proposalsNavbarItemEnabled !== newProposalsNavbarItemEnabled;

    const formChanged = proposalsSettingsChanged || proposalsNavbarItemChanged;

    if (!processing && formChanged) {
      validated = true;

      if (
        isNaN(localProposalsSettings.voting_threshold) ||
        localProposalsSettings.voting_threshold < 2 ||
        isNaN(localProposalsSettings.days_limit) ||
        localProposalsSettings.days_limit < 1
      ) {
        validated = false;
      }

      tenantLocales.forEach((locale) => {
        if (
          isEmpty(localProposalsSettings.eligibility_criteria[locale]) ||
          isEmpty(localProposalsSettings.threshold_reached_message[locale])
        ) {
          validated = false;
        }
      });
    }

    return validated;
  };

  const handleSubmit = async () => {
    const proposalsSettingsChanged = !isEqual(
      remoteProposalsSettings,
      localProposalsSettings
    );

    const proposalsNavbarItemChanged =
      proposalsNavbarItemEnabled !== newProposalsNavbarItemEnabled;

    setProcessing(true);

    try {
      if (proposalsSettingsChanged) {
        await updateAppConfiguration({
          settings: {
            initiatives: localProposalsSettings,
          },
        });
      }

      if (proposalsNavbarItemChanged) {
        await toggleProposals({ enabled: newProposalsNavbarItemEnabled });
      }

      setProcessing(false);
      setSuccess(true);
      setError(false);
    } catch (error) {
      setProcessing(false);
      setError(true);
    }
  };

  const toggleEnableSwitch = () => {
    setNewProposalsNavbarItemEnabled(!newProposalsNavbarItemEnabled);
    setSuccess(false);
  };

  const updateProposalsSetting = (settingName: ProposalssSettingName) => {
    return (value) => {
      setLocalProposalsSettings({
        ...localProposalsSettings,
        [settingName]: value,
      });
      setSuccess(false);
    };
  };

  return (
    <Container>
      <SectionTitle>
        <FormattedMessage {...messages.settingsTabTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.settingsTabSubtitle} />
      </SectionDescription>

      <Section>
        <EnableSwitch
          enabled={newProposalsNavbarItemEnabled}
          onToggle={toggleEnableSwitch}
        />

        <VotingThreshold
          value={localProposalsSettings.voting_threshold}
          onChange={updateProposalsSetting('voting_threshold')}
        />

        <VotingLimit
          value={localProposalsSettings.days_limit}
          onChange={updateProposalsSetting('days_limit')}
        />

        <ThresholdReachedMessage
          value={localProposalsSettings.threshold_reached_message}
          onChange={updateProposalsSetting('threshold_reached_message')}
        />

        <EligibilityCriteria
          value={localProposalsSettings.eligibility_criteria}
          onChange={updateProposalsSetting('eligibility_criteria')}
        />
      </Section>

      <SubmitButton
        disabled={!validate()}
        processing={processing}
        error={error}
        success={success}
        handleSubmit={handleSubmit}
      />
    </Container>
  );
};

export default InitiativesSettingsPage;

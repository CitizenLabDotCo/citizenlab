import React, { useState, useMemo, useEffect } from 'react';
import { isEmpty, isNaN, omit, isEqual } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useNavbarItemEnabled from 'hooks/useNavbarItemEnabled';
import usePage from 'hooks/usePage';

// services
import { updateAppConfiguration } from 'services/appConfiguration';
import { toggleProposals } from 'services/navbar';
import { updatePage } from 'services/pages';

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
import PageBody from './PageBody';
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

type ProposalsSettingName = keyof ProposalsSettings;

const InitiativesSettingsPage = () => {
  const appConfiguration = useAppConfiguration();
  const proposalsNavbarItemEnabled = useNavbarItemEnabled('proposals');
  const proposalsPage = usePage({ pageSlug: 'initiatives' });

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

  const [localProposalsSettings, setLocalProposalsSettings] =
    useState<ProposalsSettings | null>(null);

  useEffect(() => {
    setLocalProposalsSettings(remoteProposalsSettings);
  }, [remoteProposalsSettings]);

  const [newProposalsNavbarItemEnabled, setNewProposalsNavbarItemEnabled] =
    useState<boolean | null>(null);

  useEffect(() => {
    if (!isNilOrError(proposalsNavbarItemEnabled)) {
      setNewProposalsNavbarItemEnabled(proposalsNavbarItemEnabled);
    }
  }, [proposalsNavbarItemEnabled]);

  const [newProposalsPageBody, setNewProposalsPageBody] =
    useState<Multiloc | null>(null);

  useEffect(() => {
    if (!isNilOrError(proposalsPage)) {
      setNewProposalsPageBody(proposalsPage.attributes.body_multiloc);
    }
  }, [proposalsPage]);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (
    isNilOrError(appConfiguration) ||
    isNilOrError(proposalsNavbarItemEnabled) ||
    isNilOrError(proposalsPage) ||
    !remoteProposalsSettings ||
    !localProposalsSettings ||
    newProposalsNavbarItemEnabled === null ||
    newProposalsPageBody === null
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

    const proposalsPageBodyChanged =
      proposalsPage.attributes.body_multiloc !== newProposalsPageBody;

    const formChanged =
      proposalsSettingsChanged ||
      proposalsNavbarItemChanged ||
      proposalsPageBodyChanged;

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

    const proposalsPageBodyChanged =
      proposalsPage.attributes.body_multiloc !== newProposalsPageBody;

    setProcessing(true);

    try {
      const promises: Promise<any>[] = [];

      if (proposalsSettingsChanged) {
        const promise = updateAppConfiguration({
          settings: {
            initiatives: localProposalsSettings,
          },
        });

        promises.push(promise);
      }

      if (proposalsNavbarItemChanged) {
        const promise = toggleProposals({
          enabled: newProposalsNavbarItemEnabled,
        });
        promises.push(promise);
      }

      if (proposalsPageBodyChanged) {
        const promise = updatePage(proposalsPage.id, {
          body_multiloc: newProposalsPageBody,
        });

        promises.push(promise);
      }

      await Promise.all(promises);

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

  const updateProposalsSetting = (settingName: ProposalsSettingName) => {
    return (value) => {
      setLocalProposalsSettings({
        ...localProposalsSettings,
        [settingName]: value,
      });
      setSuccess(false);
    };
  };

  const updateProposalsPageBody = (bodyMultiloc: Multiloc) => {
    setNewProposalsPageBody(bodyMultiloc);
    setSuccess(false);
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

        <PageBody
          value={newProposalsPageBody}
          onChange={updateProposalsPageBody}
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

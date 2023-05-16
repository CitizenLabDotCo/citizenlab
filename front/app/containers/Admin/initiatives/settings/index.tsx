import React, { useState, useMemo, useEffect } from 'react';
import { isEmpty, isNaN, isEqual } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { API_PATH } from 'containers/App/constants';
// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useNavbarItemEnabled from 'hooks/useNavbarItemEnabled';
import useCustomPage from 'hooks/useCustomPage';

// services
import { ProposalsSettings } from 'api/app_configuration/types';
import { updateCustomPage } from 'services/customPages';
import streams from 'utils/streams';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

// components
import {
  SectionTitle,
  SectionDescription,
  Section,
} from 'components/admin/Section';
import Warning from 'components/UI/Warning';
import ProposalsFeatureToggle from './ProposalsFeatureToggle';
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
import AnonymousPostingToggle from './AnonymousPostingToggle';

const Container = styled.div``;

export const StyledWarning = styled(Warning)`
  margin-bottom: 7px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 10px;
`;

export const StyledSectionDescription = styled(SectionDescription)`
  margin-top: 0;
  margin-bottom: 20px;
`;

type ProposalsSettingName = keyof ProposalsSettings;

const InitiativesSettingsPage = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const {
    mutate: updateAppConfiguration,
    isLoading: isAppConfigurationLoading,
    isError: isAppConfigurationError,
  } = useUpdateAppConfiguration();
  const proposalsNavbarItemEnabled = useNavbarItemEnabled('proposals');
  const proposalsPage = useCustomPage({ customPageSlug: 'initiatives' });

  const remoteProposalsSettings = useMemo(() => {
    if (
      isNilOrError(appConfiguration) ||
      !appConfiguration.data.attributes.settings.initiatives
    ) {
      return null;
    }

    return appConfiguration.data.attributes.settings.initiatives;
  }, [appConfiguration]);

  const [localProposalsSettings, setLocalProposalsSettings] =
    useState<ProposalsSettings | null>(null);

  useEffect(() => {
    setLocalProposalsSettings(remoteProposalsSettings);
  }, [remoteProposalsSettings]);

  const [newProposalsPageBody, setNewProposalsPageBody] =
    useState<Multiloc | null>(null);

  useEffect(() => {
    if (!isNilOrError(proposalsPage)) {
      setNewProposalsPageBody(
        proposalsPage.attributes.top_info_section_multiloc
      );
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

    const proposalsPageBodyChanged =
      proposalsPage.attributes.top_info_section_multiloc !==
      newProposalsPageBody;

    const formChanged = proposalsSettingsChanged || proposalsPageBodyChanged;

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

    const proposalsPageBodyChanged =
      proposalsPage.attributes.top_info_section_multiloc !==
      newProposalsPageBody;

    setProcessing(true);

    if (proposalsSettingsChanged) {
      updateAppConfiguration({
        settings: {
          initiatives: localProposalsSettings,
        },
      });
    }

    try {
      if (proposalsPageBodyChanged) {
        await updateCustomPage(proposalsPage.id, {
          top_info_section_multiloc: newProposalsPageBody,
        });
      }

      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/nav_bar_items`],
      });

      setProcessing(false);
      setSuccess(true);
      setError(false);
    } catch (error) {
      setProcessing(false);
      setError(true);
    }
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

  const onToggle = () => {
    if (appConfiguration.data.attributes.settings.initiatives) {
      setLocalProposalsSettings({
        ...localProposalsSettings,
        enabled: !localProposalsSettings.enabled,
      });
    }
  };

  const onAnonymousPostingToggle = () => {
    setLocalProposalsSettings({
      ...localProposalsSettings,
      allow_anonymous_posting: !localProposalsSettings.allow_anonymous_posting,
    });
  };

  return (
    <Container>
      <StyledSectionTitle>
        <FormattedMessage {...messages.settingsTabTitle} />
      </StyledSectionTitle>
      <Section>
        <ProposalsFeatureToggle
          enabled={localProposalsSettings.enabled}
          onToggle={onToggle}
        />
        <AnonymousPostingToggle
          enabled={localProposalsSettings.allow_anonymous_posting}
          onToggle={onAnonymousPostingToggle}
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
        processing={processing || isAppConfigurationLoading}
        error={error || isAppConfigurationError}
        success={success}
        handleSubmit={handleSubmit}
      />
    </Container>
  );
};

export default InitiativesSettingsPage;

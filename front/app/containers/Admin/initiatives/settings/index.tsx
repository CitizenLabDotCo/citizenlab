import React, { useState, useMemo, useEffect } from 'react';
import { isEmpty, isNaN, isEqual } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useNavbarItems from 'api/navbar/useNavbarItems';
import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

// services
import { ProposalsSettings } from 'api/app_configuration/types';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

// components
import {
  SectionTitle,
  SectionDescription,
  Section,
} from 'components/admin/Section';
import Warning from 'components/UI/Warning';
import ProposalsFeatureToggle from './ProposalsFeatureToggle';
import ReactingThreshold from './ReactingThreshold';
import ReactingLimit from './ReactingLimit';
import ThresholdReachedMessage from './ThresholdReachedMessage';
import EligibilityCriteria from './EligibilityCriteria';
import PageBody from './PageBody';
import SubmitButton from './SubmitButton';
import { AnonymousPostingToggle } from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';
import RequireApprovalToggle from './RequireApprovalToggle';

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
  const {
    mutate: updateCustomPage,
    isLoading,
    isSuccess,
    isError,
    reset,
  } = useUpdateCustomPage();
  const { data: appConfiguration } = useAppConfiguration();
  const hasAnonymousParticipationEnabled = useFeatureFlag({
    name: 'anonymous_participation',
  });
  const {
    mutate: updateAppConfiguration,
    isLoading: isAppConfigurationLoading,
    isError: isAppConfigurationError,
  } = useUpdateAppConfiguration();
  const { data: navbarItems } = useNavbarItems();
  const proposalsNavbarItemEnabled = navbarItems?.data.some(
    (navbarItem) => navbarItem.attributes.code === 'proposals'
  );

  const { data: proposalsPage } = useCustomPageBySlug('initiatives');

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
        proposalsPage.data.attributes.top_info_section_multiloc
      );
    }
  }, [proposalsPage]);

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
      proposalsPage.data.attributes.top_info_section_multiloc !==
      newProposalsPageBody;

    const formChanged = proposalsSettingsChanged || proposalsPageBodyChanged;

    if (!isLoading && formChanged) {
      validated = true;

      if (
        isNaN(localProposalsSettings.reacting_threshold) ||
        localProposalsSettings.reacting_threshold < 2 ||
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
      proposalsPage.data.attributes.top_info_section_multiloc !==
      newProposalsPageBody;

    if (proposalsSettingsChanged) {
      updateAppConfiguration({
        settings: {
          initiatives: localProposalsSettings,
        },
      });
    }

    if (proposalsPageBodyChanged) {
      updateCustomPage({
        id: proposalsPage.data.id,
        top_info_section_multiloc: newProposalsPageBody,
      });
    }
  };

  const updateProposalsSetting = (settingName: ProposalsSettingName) => {
    return (value) => {
      setLocalProposalsSettings({
        ...localProposalsSettings,
        [settingName]: value,
      });
      reset();
    };
  };

  const updateProposalsPageBody = (bodyMultiloc: Multiloc) => {
    setNewProposalsPageBody(bodyMultiloc);
    reset();
  };

  const onToggle = () => {
    if (appConfiguration.data.attributes.settings.initiatives) {
      setLocalProposalsSettings({
        ...localProposalsSettings,
        enabled: !localProposalsSettings.enabled,
      });
    }
  };

  const onAnonymousPostingToggle = (value: boolean) => {
    setLocalProposalsSettings({
      ...localProposalsSettings,
      allow_anonymous_participation: value,
    });
  };

  return (
    <>
      <Title color="primary" mb="30px">
        <FormattedMessage {...messages.settingsTab} />
      </Title>
      <Box background={colors.white} p="40px">
        <StyledSectionTitle>
          <FormattedMessage {...messages.settingsTabTitle} />
        </StyledSectionTitle>
        <Section>
          <ProposalsFeatureToggle
            enabled={localProposalsSettings.enabled}
            onToggle={onToggle}
          />
          {hasAnonymousParticipationEnabled && (
            <AnonymousPostingToggle
              allow_anonymous_participation={
                localProposalsSettings.allow_anonymous_participation
              }
              handleAllowAnonymousParticipationOnChange={
                onAnonymousPostingToggle
              }
            />
          )}
          <RequireApprovalToggle
            value={localProposalsSettings.require_approval}
            onChange={updateProposalsSetting('require_approval')}
          />

          <ReactingThreshold
            value={localProposalsSettings.reacting_threshold}
            onChange={updateProposalsSetting('reacting_threshold')}
          />

          <ReactingLimit
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
          processing={isLoading || isAppConfigurationLoading}
          error={isError || isAppConfigurationError}
          success={isSuccess}
          handleSubmit={handleSubmit}
        />
      </Box>
    </>
  );
};

export default InitiativesSettingsPage;

import React, { useState, useMemo, useEffect } from 'react';
import { isEmpty, isEqual } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useNavbarItems from 'api/navbar/useNavbarItems';
import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

// services
import { ProposalsSettings } from 'api/app_configuration/types';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

// components
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import Warning from 'components/UI/Warning';
import ProposalsFeatureToggle from './ProposalsFeatureToggle';
import Thresholds from './Thresholds';
import ThresholdReachedMessage from './ThresholdReachedMessage';
import EligibilityCriteria from './EligibilityCriteria';
import PostingTips from './PostingTips';
import PageBody from './PageBody';
import SubmitButton from './SubmitButton';
import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';
import RequireReviewToggle from './RequireReviewToggle';
import Cosponsors from './Cosponsors';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { Multiloc } from 'typings';

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
        /* require_cosponsors: if the cosponsors feature is enabled for the first time,
          cosponsors_number is undefined, hence the check to see if it's a number. If you erase
          a number you already filled in, our code in Cosponsors.tsx will convert the empty string this
          erasing produces to NaN, which qualifies as a number but is not a value we want.
          To find the relevant code search for the comment hash below.
          Using a fallback number value if parseInt produces NaN is not desirable either, because
          that causes strange behavior in the UI.
          Comment hash: #6bcea39
        */
        (localProposalsSettings.require_cosponsors &&
          (typeof localProposalsSettings.cosponsors_number !== 'number' ||
            Number.isNaN(localProposalsSettings.cosponsors_number))) ||
        Number.isNaN(localProposalsSettings.reacting_threshold) ||
        localProposalsSettings.reacting_threshold < 2 ||
        Number.isNaN(localProposalsSettings.days_limit) ||
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
        <Box mb="16px">
          <ProposalsFeatureToggle
            enabled={localProposalsSettings.enabled}
            onToggle={onToggle}
          />
          <AnonymousPostingToggle
            allow_anonymous_participation={
              localProposalsSettings.allow_anonymous_participation
            }
            handleAllowAnonymousParticipationOnChange={onAnonymousPostingToggle}
          />
          <RequireReviewToggle
            value={
              typeof localProposalsSettings.require_review === 'boolean'
                ? localProposalsSettings.require_review
                : false
            }
            onChange={updateProposalsSetting('require_review')}
          />

          <Cosponsors
            requireCosponsors={localProposalsSettings.require_cosponsors}
            onChangeRequireSponsors={updateProposalsSetting(
              'require_cosponsors'
            )}
            cosponsorsNumber={localProposalsSettings.cosponsors_number}
            onChangeCosponsorsNumber={updateProposalsSetting(
              'cosponsors_number'
            )}
          />
          <Thresholds
            numberOfVotesThreshold={localProposalsSettings.reacting_threshold}
            onChangeNumberOfVotesThreshold={updateProposalsSetting(
              'reacting_threshold'
            )}
            numberOfDaysThreshold={localProposalsSettings.days_limit}
            onChangeNumberOfDaysThreshold={updateProposalsSetting('days_limit')}
          />
          <EligibilityCriteria
            value={localProposalsSettings.eligibility_criteria}
            onChange={updateProposalsSetting('eligibility_criteria')}
          />
          <PostingTips
            postingTips={localProposalsSettings.posting_tips}
            onChangePostingTips={updateProposalsSetting('posting_tips')}
          />
          <ThresholdReachedMessage
            value={localProposalsSettings.threshold_reached_message}
            onChange={updateProposalsSetting('threshold_reached_message')}
          />
          <PageBody
            value={newProposalsPageBody}
            onChange={updateProposalsPageBody}
          />
        </Box>

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

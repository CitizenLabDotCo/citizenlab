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
    newProposalsNavbarItemValue,
    setNewProposalsNavbarItemValue,
  ] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isNilOrError(proposalsNavbarItemEnabled)) {
      setNewProposalsNavbarItemValue(proposalsNavbarItemEnabled);
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
    newProposalsNavbarItemValue === null
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
      proposalsNavbarItemEnabled !== newProposalsNavbarItemValue;

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
      proposalsNavbarItemEnabled !== newProposalsNavbarItemValue;

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
        await toggleProposals({ enabled: newProposalsNavbarItemValue });
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
    setNewProposalsNavbarItemValue(!newProposalsNavbarItemValue);
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
          enabled={newProposalsNavbarItemValue}
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

// class InitiativesSettingsPage extends PureComponent<Props, State> {
//   constructor(props) {
//     super(props);
//     this.state = {
//       formValues: null,
//       updateProposalsInNavbar: null,
//       processing: false,
//       error: false,
//       success: false,
//     };
//   }

//   componentDidMount() {
//     const { locale, tenant } = this.props;

//     if (
//       !isNilOrError(locale) &&
//       !isNilOrError(tenant) &&
//       tenant.attributes.settings.initiatives
//     ) {
//       const initiativesSettings = tenant.attributes.settings.initiatives;

//       this.setState({
//         formValues: {
//           days_limit: initiativesSettings.days_limit,
//           eligibility_criteria: initiativesSettings.eligibility_criteria,
//           threshold_reached_message:
//             initiativesSettings.threshold_reached_message,
//           voting_threshold: initiativesSettings.voting_threshold,
//         },
//       });
//     }
//   }

//   validate = () => {
//     const { tenant } = this.props;
//     const { processing, formValues } = this.state;
//     const tenantLocales = !isNilOrError(tenant)
//       ? tenant.attributes.settings.core.locales
//       : null;
//     let validated = false;

//     if (!formValues) return false;

//     const proposalsSettingsChanged = !isEmpty(formValues);
//     const proposalsNavbarItemChanged =
//       this.state.updateProposalsInNavbar !== null;
//     const formChanged = proposalsSettingsChanged || proposalsNavbarItemChanged;

//     if (!processing && tenantLocales && formChanged) {
//       validated = true;

//       if (
//         isNaN(formValues.voting_threshold) ||
//         formValues.voting_threshold < 2 ||
//         isNaN(formValues.days_limit) ||
//         formValues.days_limit < 1
//       ) {
//         validated = false;
//       }

//       tenantLocales.forEach((locale) => {
//         if (
//           isEmpty(formValues.eligibility_criteria[locale]) ||
//           isEmpty(formValues.threshold_reached_message[locale])
//         ) {
//           validated = false;
//         }
//       });
//     }

//     return validated;
//   };

//   handleSubmit = async () => {
//     const { tenant } = this.props;
//     const { formValues } = this.state;

//     if (!formValues) return;

//     if (!isNilOrError(tenant) && this.validate()) {
//       this.setState({ processing: true });

//       try {
//         await updateAppConfiguration({
//           settings: {
//             initiatives: formValues,
//           },
//         });

//         const { updateProposalsInNavbar } = this.state;

//         if (updateProposalsInNavbar !== null) {
//           await toggleProposals({ enabled: updateProposalsInNavbar });
//         }

//         this.setState({
//           processing: false,
//           success: true,
//           error: false,
//         });
//       } catch (error) {
//         this.setState({
//           processing: false,
//           error: true,
//         });
//       }
//     }
//   };

//   render() {
//     const { locale, tenant, className } = this.props;
//     const { formValues, processing, error, success } = this.state;

//     if (!isNilOrError(locale) && !isNilOrError(tenant) && formValues) {
//       return (
//         <Container className={className || ''}>
//           <SectionTitle>
//             <FormattedMessage {...messages.settingsTabTitle} />
//           </SectionTitle>
//           <SectionDescription>
//             <FormattedMessage {...messages.settingsTabSubtitle} />
//           </SectionDescription>

//           <Section>
//             <EnableSwitch setParentState={this.setState} />

//             <VotingThreshold
//               formValues={formValues}
//               setParentState={this.setState}
//             />

//             <VotingLimit
//               formValues={formValues}
//               setParentState={this.setState}
//             />

//             <ThresholdReachedMessage
//               formValues={formValues}
//               setParentState={this.setState}
//             />

//             <EligibilityCriteria
//               formValues={formValues}
//               setParentState={this.setState}
//             />
//           </Section>

//           <SubmitButton
//             disabled={!this.validate()}
//             processing={processing}
//             error={error}
//             success={success}
//             handleSubmit={this.handleSubmit}
//           />
//         </Container>
//       );
//     }

//     return null;
//   }
// }

// const Data = adopt<DataProps>({
//   locale: <GetLocale />,
//   tenant: <GetAppConfiguration />,
// });

// const WrappedInitiativesSettingsPage = () => (
//   <Data>{(dataProps) => <InitiativesSettingsPage {...dataProps} />}</Data>
// );

// export default WrappedInitiativesSettingsPage;

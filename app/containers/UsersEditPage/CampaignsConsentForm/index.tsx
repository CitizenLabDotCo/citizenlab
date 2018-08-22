import React, { PureComponent } from 'react';
import messages from './messages';
import ProfileSection from '../ProfileSection';
import GetCampaignConsents, { GetCampaignConsentsChildProps } from 'resources/GetCampaignConsents';
import { IConsentData, updateConsent, IConsent } from 'services/campaignConsents';
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { FormattedMessage } from 'utils/cl-intl';
import { find } from 'lodash';

// components
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';

const CheckboxContainer = styled.div`
  padding-bottom: 0.5rem;
`;

const ConsentList = styled.div`
  margin-bottom: 40px;
`;

type InputProps = {};

type DataProps = {
  consents: GetCampaignConsentsChildProps;
};

type Props = InputProps & DataProps;

interface State {
  consentChanges: {};
  isSaving: boolean;
  saveButtonStatus: 'enabled' | 'disabled' | 'error' | 'success';
}

class CampaignsConsentForm extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props as any);
    this.state = {
      consentChanges: {},
      isSaving: false,
      saveButtonStatus: 'enabled',
    };
  }

  handleOnChange = (consent: IConsentData) => () => {
    const becomesConsented = this.isConsented(consent.id);
    this.setState(prevState => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: !becomesConsented,
      },
      saveButtonStatus: 'enabled'
    }));
  }

  isConsented = (consentId) => {
    const { consents } = this.props;
    if (!isNilOrError(consents)) {
      const consent = find(consents, { id: consentId }) as IConsentData;
      if (typeof(this.state.consentChanges[consentId]) === 'undefined') {
        return (consent && consent.attributes.consented);
      } else {
        return this.state.consentChanges[consentId];
      }
    }
    return false;
  }

  handleOnSubmit = () => {
    const { consentChanges } = this.state;
    let consentUpdates: Promise<IConsent>[] = [];

    this.setState({ isSaving: true, saveButtonStatus: 'disabled' });
    if (consentChanges) {
      consentUpdates = Object.keys(consentChanges).map(consentId => {
        return updateConsent(consentId, { consented: this.isConsented(consentId) });
      });
    }

    Promise.all(consentUpdates)
    .then(() => {
      this.setState({
        consentChanges: {},
        isSaving: false,
        saveButtonStatus: 'success'
      });
    })
    .catch(() => {
      this.setState({ saveButtonStatus: 'error' });
    });
  }

  render() {
    const { consents } = this.props;
    const { isSaving, saveButtonStatus } = this.state;
    return (
      <ProfileSection>
        <form action="">
          <SectionTitle><FormattedMessage {...messages.notificationsTitle} /></SectionTitle>
          <SectionSubtitle><FormattedMessage {...messages.notificationsSubTitle} /></SectionSubtitle>
          <ConsentList>
            {!isNilOrError(consents) && consents.map((consent) => (
              <CheckboxContainer key={consent.id}>
                <Checkbox
                  value={this.isConsented(consent.id)}
                  onChange={this.handleOnChange(consent)}
                  label={<T value={consent.attributes.campaign_type_description_multiloc} />}
                />
              </CheckboxContainer>
            ))}
          </ConsentList>
          <SubmitWrapper
            status={saveButtonStatus}
            style="primary"
            loading={isSaving}
            onClick={this.handleOnSubmit}
            messages={{
              buttonSave: messages.submit,
              buttonSuccess: messages.buttonSuccessLabel,
              messageSuccess: messages.messageSuccess,
              messageError: messages.messageError,
            }}
          />
        </form>
      </ProfileSection>
    );
  }
}

export default (inputProps) => (
  <GetCampaignConsents>
    {(consents) => <CampaignsConsentForm {...inputProps} consents={consents} />}
  </GetCampaignConsents>
);

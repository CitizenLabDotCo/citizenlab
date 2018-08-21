import React, { PureComponent } from 'react';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import ProfileSection from './ProfileSection';
import GetCampaignConsents, { GetCampaignConsentsChildProps } from 'resources/GetCampaignConsents';
import { isNilOrError } from 'utils/helperUtils';
import Checkbox from 'components/UI/Checkbox';
import { IConsentData, updateConsent, IConsent } from 'services/campaignConsents';
import styled from 'styled-components';
import T from 'components/T';
import { find } from 'lodash';

const CheckboxContainer = styled.div`
  padding-bottom: 0.5rem;
`;

type InputProps = {};

type DataProps = {
  consents: GetCampaignConsentsChildProps;
};

type Props = InputProps & DataProps;

interface State {
  consentChanges: {};
}

class CampaignsConsentForm extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props as any);
    this.state = {
      consentChanges: {},
    };
  }

  handleOnChange = (consent: IConsentData) => () => {
      const becomesConsented = this.isConsented(consent.id);
    this.setState(prevState => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: !becomesConsented,
      }
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

  handleOnSubmit() {
    const { consentChanges } = this.state;
    let consentUpdates: Promise<IConsent>[] = [];

    if (consentChanges) {
      consentUpdates = Object.keys(consentChanges).map(consentId => {
        return updateConsent(consentId, { consented: this.isConsented(consentId) });
      });
    }

    Promise.all(consentUpdates).then(() => this.setState({ consentChanges: {} }));
  }

  render() {
    const { consents } = this.props;
    return (
      <ProfileSection>
        <form action="">
          <SectionTitle><FormattedMessage {...messages.notificationsTitle} /></SectionTitle>
          <SectionSubtitle><FormattedMessage {...messages.notificationsSubTitle} /></SectionSubtitle>
          {!isNilOrError(consents) && consents.map((consent) => (
            <CheckboxContainer key={consent.id}>
              <Checkbox
                value={this.isConsented(consent.id)}
                onChange={this.handleOnChange(consent)}
                label={<T value={consent.attributes.campaign_type_description_multiloc} />}
              />
            </CheckboxContainer>
          ))}
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

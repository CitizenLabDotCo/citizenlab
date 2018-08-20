import React, { PureComponent } from 'react';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import ProfileSection from './ProfileSection';
import GetCampaignConsents, { GetCampaignConsentsChildProps } from 'resources/GetCampaignConsents';
import { isNilOrError } from 'utils/helperUtils';
import Checkbox from 'components/UI/Checkbox';
import { IConsentData, updateConsent } from 'services/campaignConsents';
import styled from 'styled-components';
import T from 'components/T';

const CheckboxContainer = styled.div`
  padding-bottom: 0.5rem;
`;

type InputProps = {};

type DataProps = {
  consents: GetCampaignConsentsChildProps;
};

type Props = InputProps & DataProps;

class CampaignsConsentForm extends PureComponent<Props> {

  handleOnChange = (consent: IConsentData) => () => {
    updateConsent(consent.id, { consented: !consent.attributes.consented });
  }

  render() {
    const { consents } = this.props;
    return (
      <ProfileSection>
        <SectionTitle><FormattedMessage {...messages.notificationsTitle} /></SectionTitle>
        <SectionSubtitle><FormattedMessage {...messages.notificationsSubTitle} /></SectionSubtitle>
        {!isNilOrError(consents) && consents.map((consent) => (
          <CheckboxContainer key={consent.id}>
            <Checkbox
              value={consent.attributes.consented}
              onChange={this.handleOnChange(consent)}
              label={<T value={consent.attributes.campaign_type_description_multiloc} />}
            />
          </CheckboxContainer>
        ))}
      </ProfileSection>
    );
  }
}

export default (inputProps) => (
  <GetCampaignConsents>
    {(consents) => <CampaignsConsentForm {...inputProps} consents={consents} />}
  </GetCampaignConsents>
);

import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

import GetCampaigns, { GetCampaignsChildProps } from 'resources/GetCampaigns';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

import messages from '../messages';
import FeatureFlag from 'components/FeatureFlag';
import PageWrapper, { ButtonWrapper } from 'components/admin/PageWrapper';
import DraftCampaignRow from './DraftCampaignRow';
import SentCampaignRow from './SentCampaignRow';

const CampaignTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 3rem;
`;

interface InputProps { }

interface DataProps {
  campaigns: GetCampaignsChildProps;
}

interface Props extends InputProps, DataProps { }

interface State { }

class Campaigns extends React.Component<Props & InjectedIntlProps, State> {

  render() {
    const campaigns = this.props.campaigns;

    if (isNilOrError(campaigns)) return null;

    return (
      <>
        <CampaignTitle>
          <FormattedMessage {...messages.listTitle} />
        </CampaignTitle>

        <PageWrapper>
          <FeatureFlag name="segmented_emailing">
            <ButtonWrapper>
              <Button
                style="cl-blue"
                circularCorners={false}
                icon="plus-circle"
                linkTo="/admin/campaigns/new"
              >
                <FormattedMessage {...messages.addCampaignButton} />
              </Button>
            </ButtonWrapper>
          </FeatureFlag>
          <List key={campaigns.length}>
            {campaigns.map((campaign) => (
              campaign.attributes.sent_at ?
                <SentCampaignRow key={campaign.id} campaign={campaign} />
              :
                <DraftCampaignRow key={campaign.id} campaign={campaign} />
            ))}
          </List>
        </PageWrapper>
      </>
    );
  }
}

const CampaignsWithInjectedIntl = injectIntl<Props>(Campaigns);

export default (inputProps: Props) => (
  <GetCampaigns campaignNames={['manual']} >
    {campaigns => <CampaignsWithInjectedIntl {...inputProps} campaigns={campaigns} />}
  </GetCampaigns>
);

import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

import GetCampaigns, { GetCampaignsChildProps } from 'resources/GetCampaigns';
import { isDraft } from 'services/campaigns';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import Pagination from 'components/admin/Pagination';

import messages from '../../messages';
import FeatureFlag from 'components/FeatureFlag';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import { SectionTitle } from 'components/admin/Section';
import DraftCampaignRow from './DraftCampaignRow';
import SentCampaignRow from './SentCampaignRow';

interface InputProps { }

interface DataProps extends GetCampaignsChildProps {}

interface Props extends InputProps, DataProps { }

interface State { }

class Campaigns extends React.Component<Props & InjectedIntlProps, State> {

  render() {
    const { campaigns, currentPage, lastPage } = this.props;

    if (isNilOrError(campaigns)) return null;

    return (
      <>
        <FeatureFlag name="segmented_emailing">
          <SectionTitle>
            <FormattedMessage {...messages.listTitle} />
          </SectionTitle>
          <ButtonWrapper>
            <Button
              style="cl-blue"
              circularCorners={false}
              icon="plus-circle"
              linkTo="/admin/emails/manual/new"
            >
              <FormattedMessage {...messages.addCampaignButton} />
            </Button>
          </ButtonWrapper>
        </FeatureFlag>
        <List key={campaigns.map(c => c.id).join()}>
          {campaigns.map((campaign) => (
            isDraft(campaign) ?
              <DraftCampaignRow key={campaign.id} campaign={campaign} />
            :
              <SentCampaignRow key={campaign.id} campaign={campaign} />
          ))}
        </List>
        <Pagination
          currentPage={currentPage}
          totalPages={lastPage}
          loadPage={this.props.onChangePage}
        />
      </>
    );
  }
}

const CampaignsWithInjectedIntl = injectIntl<Props>(Campaigns);

export default (inputProps: Props) => (
  <GetCampaigns campaignNames={['manual']} pageSize={10}>
    {campaigns => <CampaignsWithInjectedIntl {...inputProps} {...campaigns} />}
  </GetCampaigns>
);

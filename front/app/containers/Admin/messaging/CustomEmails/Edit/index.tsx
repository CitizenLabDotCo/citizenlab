import * as React from 'react';
import { ICampaignData, updateCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';

import GetCampaign from 'resources/GetCampaign';
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import messages from '../../messages';

interface Props {
  campaign: ICampaignData;
}

const Edit = ({ campaign }: Props) => {
  const handleSubmit = async (values: FormValues) => {
    await updateCampaign(campaign.id, {
      ...values,
    });

    clHistory.push(`/admin/messaging/emails/custom/${campaign.id}`);
  };

  const goBack = () => {
    const { id } = campaign;
    clHistory.push(`/admin/messaging/emails/custom/${id}`);
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.editCampaignTitle} />
      </PageTitle>
      <CampaignForm
        onSubmit={handleSubmit}
        defaultValues={{
          sender: campaign.attributes.sender,
          reply_to: campaign.attributes.reply_to,
          subject_multiloc: campaign.attributes.subject_multiloc,
          body_multiloc: campaign.attributes.body_multiloc,
          group_ids: campaign.relationships.groups.data.map((d) => d.id),
        }}
      />
    </div>
  );
};

export default withRouter((withRouterProps: WithRouterProps) => (
  <GetCampaign id={withRouterProps.params.campaignId}>
    {(campaign) =>
      isNilOrError(campaign) ? null : <Edit campaign={campaign} />
    }
  </GetCampaign>
));

import * as React from 'react';
import { updateCampaign, ICampaignData } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import { Box } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

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
    <Box background={colors.white} p="40px">
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
    </Box>
  );
};

export default withRouter((withRouterProps: WithRouterProps) => (
  <GetCampaign id={withRouterProps.params.campaignId}>
    {(campaign) =>
      isNilOrError(campaign) ? null : <Edit campaign={campaign} />
    }
  </GetCampaign>
));

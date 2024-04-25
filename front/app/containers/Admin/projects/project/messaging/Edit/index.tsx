import * as React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import GetCampaign from 'resources/GetCampaign';

import { ICampaignData } from 'api/campaigns/types';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

import CampaignForm, { FormValues, PageTitle } from '../CampaignForm';
import messages from '../messages';

interface Props {
  campaign: ICampaignData;
}

const Edit = ({ campaign }: Props) => {
  const { projectId } = useParams();
  const { mutateAsync: updateCampaign, isLoading } = useUpdateCampaign();
  const handleSubmit = async (values: FormValues) => {
    await updateCampaign({ id: campaign.id, campaign: values });
    clHistory.push(`/admin/projects/${projectId}/messaging/${campaign.id}`);
  };

  const goBack = () => {
    clHistory.push(`/admin/projects/${projectId}/messaging/${campaign.id}`);
  };

  return (
    <Box p="44px">
      <Box background={colors.white} p="40px">
        <GoBackButton onClick={goBack} />
        <PageTitle>
          <FormattedMessage {...messages.editCampaignTitle} />
        </PageTitle>
        <CampaignForm
          isLoading={isLoading}
          onSubmit={handleSubmit}
          defaultValues={{
            sender: campaign.attributes.sender,
            reply_to: campaign.attributes.reply_to,
            subject_multiloc: campaign.attributes.subject_multiloc,
            body_multiloc: campaign.attributes.body_multiloc,
          }}
        />
      </Box>
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

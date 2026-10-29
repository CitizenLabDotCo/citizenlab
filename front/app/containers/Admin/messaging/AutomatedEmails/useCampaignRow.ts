import useAddEmailCampaign from 'api/campaigns/email/useAddEmailCampaign';
import useUpdateEmailCampaign from 'api/campaigns/email/useUpdateEmailCampaign';
import { CampaignContext } from 'api/campaigns/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import clHistory from 'utils/cl-router/history';

import { CampaignData } from './types';

interface Params {
  campaign: CampaignData;
  context?: CampaignContext;
  editPath: (campaignId: string) => string;
}

const useCampaignRow = ({ campaign, context, editPath }: Params) => {
  const { mutate: addCampaign } = useAddEmailCampaign();
  const { mutate: updateCampaign } = useUpdateEmailCampaign();
  const globalFeatureActivated = useFeatureFlag({
    name: 'customised_automated_emails',
  });
  const contextFeatureActivated = useFeatureFlag({
    name: 'customised_automated_context_emails',
  });

  const unpersistedContextCampaign =
    context && !campaign.relationships.context?.data?.id;

  const toggleEnabled = () => {
    if (unpersistedContextCampaign) {
      addCampaign({
        context,
        campaign_name: campaign.attributes.campaign_name,
        enabled: !campaign.attributes.enabled,
      });
    } else {
      updateCampaign({
        id: campaign.id,
        campaign: {
          enabled: !campaign.attributes.enabled,
        },
      });
    }
  };

  const openEditor = () => {
    if (unpersistedContextCampaign) {
      addCampaign(
        {
          context,
          campaign_name: campaign.attributes.campaign_name,
          enabled: campaign.attributes.enabled,
        },
        {
          onSuccess: (addedCampaign) => {
            clHistory.push(editPath(addedCampaign.data.id));
          },
        }
      );
    } else {
      clHistory.push(editPath(campaign.id));
    }
  };

  const isComingSoon =
    (campaign.attributes.editable_regions || []).length === 0;
  const isContextDisabled = context && !campaign.attributes.enabled;
  const isOutsidePlan =
    !globalFeatureActivated || (context && !contextFeatureActivated);

  return {
    toggleEnabled,
    openEditor,
    isComingSoon,
    isOutsidePlan: !!isOutsidePlan,
    isEditable: !isComingSoon && !isContextDisabled && !isOutsidePlan,
    canBeDisabled: campaign.attributes.can_be_disabled,
  };
};

export default useCampaignRow;

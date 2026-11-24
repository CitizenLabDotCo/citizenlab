import useEmailCampaigns from 'api/campaigns/email/useEmailCampaigns';
import useSupportedEmailCampaignNames from 'api/campaigns/email/useSupportedEmailCampaignNames';

import useLocalize from 'hooks/useLocalize';

import { CampaignData } from 'containers/Admin/messaging/AutomatedEmails/types';
import { stringifyCampaignFields } from 'containers/Admin/messaging/AutomatedEmails/utils';

/**
 * The emails a phase supports, each as the phase's own campaign when it has
 * one, otherwise as the platform-wide campaign it falls back to.
 */
const usePhaseEmailCampaigns = (phaseId?: string) => {
  const localize = useLocalize();
  const { data: supportedCampaigns, isLoading: loadingNames } =
    useSupportedEmailCampaignNames({ phaseId });
  const { data: contextPages, isLoading: loadingContext } = useEmailCampaigns({
    ...(phaseId ? { context: { phaseId } } : {}),
    pageSize: 250,
  });
  const { data: globalPages, isLoading: loadingGlobal } = useEmailCampaigns({
    pageSize: 250,
  });

  const contextCampaigns = contextPages?.pages.flatMap((page) => page.data);
  const globalCampaigns = globalPages?.pages.flatMap((page) => page.data);
  const names = supportedCampaigns?.data.attributes || [];

  const campaigns = names.flatMap((name): CampaignData[] => {
    const campaign =
      contextCampaigns?.find(
        ({ attributes }) => attributes.campaign_name === name
      ) ??
      globalCampaigns?.find(
        ({ attributes }) => attributes.campaign_name === name
      );

    return campaign ? [stringifyCampaignFields(campaign, localize)] : [];
  });

  return {
    campaigns,
    loading: loadingNames || loadingContext || loadingGlobal,
  };
};

export default usePhaseEmailCampaigns;

import { useState, useEffect } from 'react';
import {
  textingCampaignStream,
  ITextingCampaignData,
} from 'services/textingCampaigns';
import { isNilOrError } from 'utils/helperUtils';

export default function useTextingCampaign(campaignId: string) {
  const [textingCampaign, setTextingCampaign] = useState<
    ITextingCampaignData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = textingCampaignStream(campaignId).observable.subscribe(
      (textingCampaign) => {
        isNilOrError(textingCampaign)
          ? setTextingCampaign(textingCampaign)
          : setTextingCampaign(textingCampaign.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [campaignId]);

  return textingCampaign;
}

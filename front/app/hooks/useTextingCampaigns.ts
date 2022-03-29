import { useState, useEffect } from 'react';
import {
  textingCampaignsStream,
  ITextingCampaignData,
} from 'services/textingCampaigns';
import { isNilOrError } from 'utils/helperUtils';

export default function useTextingCampaigns() {
  const [textingCampaigns, setTextingCampaigns] = useState<
    ITextingCampaignData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = textingCampaignsStream().observable.subscribe(
      (textingCampaigns) => {
        isNilOrError(textingCampaigns)
          ? setTextingCampaigns(textingCampaigns)
          : setTextingCampaigns(textingCampaigns.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return textingCampaigns;
}

import useFeatureFlag from 'hooks/useFeatureFlag';

// How SMS campaigns show up in the messaging admin:
// - hidden: no password login, so SMS campaigns are not on offer at all.
// - upsell: password login is on, but SMS campaigns are not. The tab is shown
//   disabled, pointing the admin to their GovSuccess manager.
// - enabled: the tab and its content work normally.
export type SmsAvailability = 'hidden' | 'upsell' | 'enabled';

type SmsAvailabilityParams = {
  passwordLoginEnabled: boolean;
  smsEnabled: boolean;
  smsManualCampaignsEnabled: boolean;
};

export const getSmsAvailability = ({
  passwordLoginEnabled,
  smsEnabled,
  smsManualCampaignsEnabled,
}: SmsAvailabilityParams): SmsAvailability => {
  if (!passwordLoginEnabled) return 'hidden';
  // The sms feature carries the Twilio settings manual campaigns send through.
  if (smsEnabled && smsManualCampaignsEnabled) return 'enabled';
  return 'upsell';
};

export const useSmsAvailability = (): SmsAvailability => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const smsEnabled = useFeatureFlag({ name: 'sms' });
  const smsManualCampaignsEnabled = useFeatureFlag({
    name: 'sms_manual_campaigns',
  });

  return getSmsAvailability({
    passwordLoginEnabled,
    smsEnabled,
    smsManualCampaignsEnabled,
  });
};

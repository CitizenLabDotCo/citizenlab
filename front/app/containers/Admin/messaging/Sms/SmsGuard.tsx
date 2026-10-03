import React, { ReactNode } from 'react';

import { useSmsAvailability } from './smsAvailability';

// Wraps every SMS campaign page. Unless SMS campaigns are fully available, the
// SMS tab is hidden or disabled, so its pages render nothing either, even when
// reached by URL. The pages are not mounted at all, so they fetch nothing.
const SmsGuard = ({ children }: { children: ReactNode }) => {
  const smsAvailability = useSmsAvailability();
  if (smsAvailability !== 'enabled') return null;
  return <>{children}</>;
};

export default SmsGuard;

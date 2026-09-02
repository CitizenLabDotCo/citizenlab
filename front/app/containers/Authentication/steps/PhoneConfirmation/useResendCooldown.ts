import { useCallback, useEffect, useState } from 'react';

import { secondsUntilResendAllowed } from 'api/authentication/confirm_phone/resendCooldown';

// Counts down the wait the backend last reported, so the step offers a resend
// only once one would actually be accepted. `syncCooldown` picks up the new wait
// without waiting for the next tick, after a request that set one.
const useResendCooldown = () => {
  const [secondsUntilResend, setSecondsUntilResend] = useState(
    secondsUntilResendAllowed
  );

  const syncCooldown = useCallback(
    () => setSecondsUntilResend(secondsUntilResendAllowed()),
    []
  );

  useEffect(() => {
    if (secondsUntilResend === 0) return;

    const interval = setInterval(syncCooldown, 1000);
    return () => clearInterval(interval);
  }, [secondsUntilResend, syncCooldown]);

  return { secondsUntilResend, syncCooldown };
};

export default useResendCooldown;

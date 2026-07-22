import { useMemo } from 'react';

import { measureSms, SmsSegments } from 'utils/sms/segments';

// Memoized wrapper around measureSms for the compose form's live counter, which
// re-measures on every keystroke. measureSms itself stays a plain function so the yup
// validator — which runs outside React render — can call it too.
const useSmsSegments = (body: string): SmsSegments =>
  useMemo(() => measureSms(body), [body]);

export default useSmsSegments;

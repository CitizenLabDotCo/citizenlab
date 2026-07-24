import { useMemo } from 'react';

import { measureSms, SmsSegments } from '../utils/segments';

// Memoizes measureSms for the keystroke-driven counter. measureSms stays a plain function
// so the yup validator, which runs outside React, can call it too.
const useSmsSegments = (body: string): SmsSegments =>
  useMemo(() => measureSms(body), [body]);

export default useSmsSegments;

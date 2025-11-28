import { string } from 'yup';

import { InputStatusCode } from 'api/idea_statuses/types';

const inputStatusCodes: InputStatusCode[] = [
  'custom',
  'prescreening',
  'proposed',
  'viewed',
  'under_consideration',
  'accepted',
  'rejected',
  'implemented',
  'threshold_reached',
  'expired',
  'answered',
  'ineligible',
];

const validateInputStatusCode = () => string().oneOf(inputStatusCodes);

export default validateInputStatusCode;

import { useState } from 'react';

import { uuid4 } from '@sentry/utils';

const useInstanceId = () => {
  return useState(() => uuid4())[0];
};

export default useInstanceId;

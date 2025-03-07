import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

const useInstanceId = () => {
  return useState(() => uuidv4())[0];
};

export default useInstanceId;

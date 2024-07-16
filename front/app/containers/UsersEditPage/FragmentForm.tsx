import React, { useEffect, useState } from 'react';

import Fragment from 'components/Fragment';

import { getJwt } from 'utils/auth/jwt';

export default () => {
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    setJwt(getJwt() || null);
  }, []);

  return (
    <Fragment
      name="profile-settings-section"
      queryParameters={jwt ? { jwt } : undefined}
    />
  );
};

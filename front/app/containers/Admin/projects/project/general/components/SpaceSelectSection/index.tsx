import React from 'react';

import useSpaces from 'api/spaces/useSpaces';

const SpaceSelectSection = () => {
  const { data: spaces } = useSpaces();

  if (!spaces) return null;

  return <>TODO</>;
};

export default SpaceSelectSection;

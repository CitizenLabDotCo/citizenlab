import React from 'react';

import MoreActions from '../Menu/MoreActions';

import useSpaceActions from './useSpaceActions';

interface Props {
  spaceId: string;
}

// A space's "⋯" on its tile or row.
const SpaceActions = ({ spaceId }: Props) => {
  const { entries } = useSpaceActions(spaceId);
  return <MoreActions entries={entries} />;
};

export default SpaceActions;

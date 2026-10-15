import React from 'react';

import { ArrangePlace } from '../Arrange/arrangeTargets';
import MoreActions from '../Menu/MoreActions';

import useSpaceActions from './useSpaceActions';

interface Props {
  spaceId: string;
  place?: ArrangePlace;
}

// A space's "⋯" on its tile or row.
const SpaceActions = ({ spaceId, place }: Props) => {
  const { entries } = useSpaceActions(spaceId, place);
  return <MoreActions entries={entries} />;
};

export default SpaceActions;

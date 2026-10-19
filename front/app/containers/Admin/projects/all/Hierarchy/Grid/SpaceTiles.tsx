import React from 'react';

import { Spaces } from 'api/spaces/types';

import useArrangeGroup, {
  ArrangeGroupContext,
} from '../Arrange/useArrangeGroup';

import SpaceTile from './SpaceTile';
import TileGrid from './TileGrid';

interface Props {
  spaces: Spaces;
  arrangeable: boolean;
}

const SpaceTiles = ({ spaces, arrangeable }: Props) => {
  // Every space is loaded at once.
  const { shown, placeOf, group } = useArrangeGroup({
    kind: 'space',
    items: spaces.data,
    hasMore: false,
    arrangeable,
  });

  return (
    <ArrangeGroupContext.Provider value={group}>
      <TileGrid>
        {shown.map((space) => (
          <SpaceTile key={space.id} space={space} place={placeOf(space)} />
        ))}
      </TileGrid>
    </ArrangeGroupContext.Provider>
  );
};

export default SpaceTiles;

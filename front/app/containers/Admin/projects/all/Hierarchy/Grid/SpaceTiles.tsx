import React from 'react';

import { Spaces } from 'api/spaces/types';

import { placesIn } from '../Arrange/arrangeTargets';

import SpaceTile from './SpaceTile';
import TileGrid from './TileGrid';

interface Props {
  spaces: Spaces;
  arrangeable: boolean;
}

const SpaceTiles = ({ spaces, arrangeable }: Props) => {
  // Every space is loaded at once.
  const placeAt = arrangeable ? placesIn(spaces.data, false) : undefined;

  return (
    <TileGrid>
      {spaces.data.map((space, index) => (
        <SpaceTile key={space.id} space={space} place={placeAt?.(index)} />
      ))}
    </TileGrid>
  );
};

export default SpaceTiles;

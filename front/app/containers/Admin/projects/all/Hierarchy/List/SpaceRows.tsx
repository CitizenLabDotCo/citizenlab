import React from 'react';

import { Spaces } from 'api/spaces/types';

import { placesIn } from '../Arrange/arrangeTargets';

import { ColumnKey } from './columns';
import SpaceRow from './SpaceRow';
import useManagers from './useManagers';

interface Props {
  spaces: Spaces;
  columns: ColumnKey[];
  arrangeable: boolean;
}

const SpaceRows = ({ spaces, columns, arrangeable }: Props) => {
  const managersOf = useManagers(spaces.included);
  // Every space is loaded at once.
  const placeAt = arrangeable ? placesIn(spaces.data, false) : undefined;

  return (
    <>
      {spaces.data.map((space, index) => (
        <SpaceRow
          key={space.id}
          space={space}
          columns={columns}
          managers={managersOf(space.relationships.moderators.data)}
          place={placeAt?.(index)}
        />
      ))}
    </>
  );
};

export default SpaceRows;

import React from 'react';

import { Spaces } from 'api/spaces/types';

import { ColumnKey } from './columns';
import SpaceRow from './SpaceRow';
import useManagers from './useManagers';

interface Props {
  spaces: Spaces;
  columns: ColumnKey[];
}

const SpaceRows = ({ spaces, columns }: Props) => {
  const managersOf = useManagers(spaces.included);

  return (
    <>
      {spaces.data.map((space) => (
        <SpaceRow
          key={space.id}
          space={space}
          columns={columns}
          managers={managersOf(space.relationships.moderators.data)}
        />
      ))}
    </>
  );
};

export default SpaceRows;

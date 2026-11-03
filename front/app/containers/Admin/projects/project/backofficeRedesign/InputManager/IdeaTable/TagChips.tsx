import React from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';

import TagChip from '../TagChip';

const VISIBLE_TAGS = 2;

interface Props {
  labels: string[];
}

const TagChips = ({ labels }: Props) => {
  const hidden = labels.slice(VISIBLE_TAGS);

  return (
    <Box display="flex" alignItems="center" gap="4px">
      {labels.slice(0, VISIBLE_TAGS).map((label) => (
        <TagChip key={label} label={label} />
      ))}
      {hidden.length > 0 && (
        <Tooltip content={hidden.join(', ')} theme="dark">
          <Box>
            <TagChip label={`+${hidden.length}`} />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default TagChips;

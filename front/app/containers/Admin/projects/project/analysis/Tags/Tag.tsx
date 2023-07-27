import { Box, colors } from '@citizenlab/cl2-component-library';
import { TagType } from 'api/analysis_tags/types';
import React from 'react';

type TagProps = {
  name: string;
  tag_type: TagType;
};

const TagTypeColorMap: Record<
  TagType,
  {
    background: string;
    text: string;
  }
> = {
  custom: {
    background: colors.green100,
    text: colors.green700,
  },
};

const Tag = ({ name, tag_type }: TagProps) => {
  return (
    <Box bg={TagTypeColorMap[tag_type]?.background} px="12px" py="4px">
      <Box color={TagTypeColorMap[tag_type]?.text}>{name}</Box>
    </Box>
  );
};

export default Tag;

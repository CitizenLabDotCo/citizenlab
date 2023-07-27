import { Box, Button, colors } from '@citizenlab/cl2-component-library';
import { TagType } from 'api/analysis_tags/types';
import React from 'react';

type TagProps = {
  name: string;
  tagType: TagType;
  tagginsConfig?: {
    isSelectedAsTagging: boolean;
    onAddTagging: () => void;
    onDeleteTagging: () => void;
  };
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

const Tag = ({ name, tagType, tagginsConfig }: TagProps) => {
  return (
    <Box
      bg={TagTypeColorMap[tagType]?.background}
      px="12px"
      py="4px"
      opacity={tagginsConfig?.isSelectedAsTagging === false ? 0.5 : 1}
    >
      <Box color={TagTypeColorMap[tagType]?.text}>{name}</Box>
      {tagginsConfig?.isSelectedAsTagging === true && (
        <Button onClick={tagginsConfig.onDeleteTagging}>
          <Box color={TagTypeColorMap[tagType]?.text}>Remove</Box>
        </Button>
      )}
      {tagginsConfig?.isSelectedAsTagging === false && (
        <Button onClick={tagginsConfig.onAddTagging}>
          <Box color={TagTypeColorMap[tagType]?.text}>Add</Box>
        </Button>
      )}
    </Box>
  );
};

export default Tag;

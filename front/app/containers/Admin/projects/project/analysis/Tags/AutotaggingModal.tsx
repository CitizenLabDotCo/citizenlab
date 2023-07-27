import { Box, colors, Title, Button } from '@citizenlab/cl2-component-library';
import { TagType, tagTypes } from 'api/analysis_tags/types';
import React from 'react';

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
  controversial: {
    background: colors.red100,
    text: colors.red600,
  },
  language: {
    background: colors.teal100,
    text: colors.teal700,
  },
  nlp_topic: {
    background: colors.grey100,
    text: colors.grey700,
  },
  platform_topic: {
    background: colors.coolGrey300,
    text: colors.coolGrey700,
  },
  sentiment: {
    background: colors.black,
    text: colors.white,
  },
};

const AutotaggingModal = () => {
  return (
    <Box>
      <Title>Autotagging modal</Title>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">
        {tagTypes.map((tagType) => {
          return (
            <Box w="50%" key={tagType} p="4px">
              <Button
                bgColor={TagTypeColorMap[tagType]?.background}
                textColor={TagTypeColorMap[tagType]?.text}
              >
                {tagType}
              </Button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default AutotaggingModal;

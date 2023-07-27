import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
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

const Tag = ({ name, tagType, tagginsConfig }: TagProps) => {
  return (
    <Box
      bg={TagTypeColorMap[tagType]?.background}
      px="12px"
      py="4px"
      opacity={tagginsConfig?.isSelectedAsTagging === false ? 0.5 : 1}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      borderRadius="3px"
      gap="4px"
      as={tagginsConfig ? 'button' : 'div'}
      onClick={
        tagginsConfig
          ? () => {
              if (tagginsConfig?.isSelectedAsTagging === true) {
                tagginsConfig.onDeleteTagging();
              } else if (tagginsConfig?.isSelectedAsTagging === false) {
                tagginsConfig.onAddTagging();
              }
            }
          : undefined
      }
      tabIndex={tagginsConfig ? 0 : undefined}
      style={{
        cursor: tagginsConfig ? 'pointer' : undefined,
      }}
    >
      <Box color={TagTypeColorMap[tagType]?.text}>{name}</Box>
      {tagginsConfig?.isSelectedAsTagging === true && (
        <Icon
          name="plus"
          fill={TagTypeColorMap[tagType]?.text}
          width="16px"
          height="16px"
        />
      )}
      {tagginsConfig?.isSelectedAsTagging === false && (
        <Icon
          name="minus"
          width="16px"
          height="16px"
          fill={TagTypeColorMap[tagType]?.text}
        />
      )}
    </Box>
  );
};

export default Tag;

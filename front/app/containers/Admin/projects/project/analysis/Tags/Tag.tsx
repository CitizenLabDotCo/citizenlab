import { Box, Icon } from '@citizenlab/cl2-component-library';

import React from 'react';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';
import { AutoTaggingMethod } from 'api/analysis_background_tasks/types';

type TagProps = {
  name: string;
  tagType: AutoTaggingMethod;
  tagginsConfig?: {
    isSelectedAsTagging: boolean;
    onAddTagging: () => void;
    onDeleteTagging: () => void;
  };
};

export const TagTypeColorMap: Record<
  AutoTaggingMethod,
  {
    background: string;
    text: string;
  }
> = {
  custom: {
    background: '#F6EAD3',
    text: '#D49210',
  },
  controversial: {
    background: '#FDE9E8',
    text: '#DF4237',
  },
  language: {
    background: '#E4F7EF',
    text: '#024D2B',
  },
  nlp_topic: {
    background: '#BEE7EB',
    text: '#0A5159',
  },
  platform_topic: {
    background: '#E4E7EF',
    text: '#515BA1',
  },
  sentiment: {
    background: '#43515D',
    text: '#FFFFFF',
  },
  few_shot_classification: {
    background: '#BEE7EB',
    text: '#0A5159',
  },
  label_classification: {
    background: '#BEE7EB',
    text: '#0A5159',
  },
};

const Tag = ({ name, tagType, tagginsConfig }: TagProps) => {
  const handleTagClick = () => {
    if (tagginsConfig?.isSelectedAsTagging === true) {
      trackEventByName(tracks.tagAssignmentDeleted.name);
      tagginsConfig.onDeleteTagging();
    } else if (tagginsConfig?.isSelectedAsTagging === false) {
      trackEventByName(tracks.tagAssignmentCreated.name);
      tagginsConfig.onAddTagging();
    }
  };
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
      border={`1px solid ${TagTypeColorMap[tagType]?.text}`}
      onClick={tagginsConfig ? handleTagClick : undefined}
      tabIndex={tagginsConfig ? 0 : undefined}
      style={{
        cursor: tagginsConfig ? 'pointer' : undefined,
      }}
    >
      <Box color={TagTypeColorMap[tagType]?.text}>{name}</Box>
      {tagginsConfig?.isSelectedAsTagging === true && (
        <Icon
          name="close"
          fill={TagTypeColorMap[tagType]?.text}
          width="16px"
          height="16px"
        />
      )}
      {tagginsConfig?.isSelectedAsTagging === false && (
        <Icon
          name="plus"
          width="16px"
          height="16px"
          fill={TagTypeColorMap[tagType]?.text}
        />
      )}
    </Box>
  );
};

export default Tag;

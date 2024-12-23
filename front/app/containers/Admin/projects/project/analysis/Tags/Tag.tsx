import React from 'react';

import { Box, Icon } from '@citizenlab/cl2-component-library';

import { TagType } from 'api/analysis_tags/types';

import tracks from 'containers/Admin/projects/project/analysis/tracks';

import { trackEventByName } from 'utils/analytics';

type TagProps = {
  name: string;
  tagType: TagType;
  tagginsConfig?: {
    isSelectedAsTagging: boolean;
    onAddTagging: () => void;
    onDeleteTagging: () => void;
  };
};

export const TagTypeColorMap: Record<
  TagType,
  {
    background: string;
    text: string;
  }
> = {
  custom: {
    background: '#FFF3DB',
    text: '#D49210',
  },
  onboarding_example: {
    background: '#F2E6D0',
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
};

const Tag = ({ name, tagType, tagginsConfig }: TagProps) => {
  const handleTagClick = () => {
    if (tagginsConfig?.isSelectedAsTagging === true) {
      trackEventByName(tracks.tagAssignmentDeleted);
      tagginsConfig.onDeleteTagging();
    } else if (tagginsConfig?.isSelectedAsTagging === false) {
      trackEventByName(tracks.tagAssignmentCreated);
      tagginsConfig.onAddTagging();
    }
  };
  return (
    <Box
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      border={`1px solid ${TagTypeColorMap[tagType]?.text}`}
      onClick={tagginsConfig ? handleTagClick : undefined}
      tabIndex={tagginsConfig ? 0 : undefined}
      style={{
        cursor: tagginsConfig ? 'pointer' : undefined,
      }}
      data-cy="e2e-analysis-tag"
    >
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      <Box color={TagTypeColorMap[tagType]?.text}>{name}</Box>
      {tagginsConfig?.isSelectedAsTagging === true && (
        <Icon
          name="close"
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          fill={TagTypeColorMap[tagType]?.text}
        />
      )}
    </Box>
  );
};

export default Tag;

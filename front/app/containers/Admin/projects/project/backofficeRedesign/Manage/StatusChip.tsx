import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  status: IIdeaStatusData;
  selected?: boolean;
}

const StatusChip = ({ status, selected = false }: Props) => {
  const localize = useLocalize();
  const color = status.attributes.color;

  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      gap="6px"
      px="8px"
      py="3px"
      borderRadius="999px"
      border={`1px solid ${selected ? color : 'transparent'}`}
      bgColor={colors.grey100}
    >
      <Box
        as="span"
        w="7px"
        h="7px"
        borderRadius="50%"
        flexShrink={0}
        style={{ backgroundColor: color }}
      />
      <Text
        as="span"
        m="0"
        fontSize="xs"
        fontWeight="semi-bold"
        style={{ color }}
      >
        {localize(status.attributes.title_multiloc)}
      </Text>
    </Box>
  );
};

export default StatusChip;

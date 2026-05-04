import React from 'react';

import {
  Box,
  Icon,
  Text,
  truncate,
  colors,
} from '@citizenlab/cl2-component-library';

import useSpace from 'api/spaces/useSpace';

import useLocalize from 'hooks/useLocalize';

interface Props {
  spaceId: string;
}

const SpaceName = ({ spaceId }: Props) => {
  const { data: space } = useSpace(spaceId);
  const localize = useLocalize();

  return (
    <Box display="flex" alignItems="center" gap="4px">
      <Icon name="spaces" fill={colors.coolGrey600} width="14px" />
      <Text color="coolGrey600" m="0px" fontSize="s" p="0">
        {truncate(localize(space?.data.attributes.title_multiloc), 40)}
      </Text>
    </Box>
  );
};

export default SpaceName;

import React from 'react';
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

type Props = {
  textContent: JSX.Element;
};

const InfoBar = ({ textContent }: Props) => {
  return (
    <Box
      width="100%"
      pl="12px"
      borderRadius="3px"
      background={colors.clBlueDarkBg}
      display="flex"
      flexDirection="row"
      alignItems="center"
      gap="10px"
    >
      <Icon width="20px" name="info" fill={colors.clBlueDarker} />
      <Text fontSize="m" color="clBlueDarker">
        {textContent}
      </Text>
    </Box>
  );
};

export default InfoBar;

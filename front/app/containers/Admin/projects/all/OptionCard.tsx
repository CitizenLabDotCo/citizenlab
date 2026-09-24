import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  icon: IconNames;
  title: string;
  description: string;
  onClick: () => void;
}

const OptionCard = ({ icon, title, description, onClick }: Props) => (
  <Box
    as="button"
    type="button"
    display="flex"
    gap="12px"
    p="16px"
    width="100%"
    alignItems="flex-start"
    background="transparent"
    border="none"
    onClick={onClick}
    cursor="pointer"
  >
    <Icon name={icon} fill={colors.textSecondary} mt="2px" />
    <Box>
      <Title variant="h6" my="0px" color="primary" textAlign="left">
        {title}
      </Title>
      <Text
        variant="bodyS"
        mt="4px"
        mb="0px"
        color="textSecondary"
        textAlign="left"
      >
        {description}
      </Text>
    </Box>
  </Box>
);

export default OptionCard;

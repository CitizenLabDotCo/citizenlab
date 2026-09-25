import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Row = styled(Box)`
  &:hover {
    background: ${colors.grey100};
  }
`;

interface Props {
  icon: IconNames;
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

const OptionRow = ({ icon, label, description, selected, onClick }: Props) => {
  return (
    <Row
      as="button"
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      w="100%"
      display="flex"
      alignItems={description ? 'flex-start' : 'center'}
      gap="12px"
      p="8px"
      background="transparent"
      border="none"
      borderRadius={stylingConsts.borderRadius}
      cursor="pointer"
    >
      <Icon
        name={icon}
        width="20px"
        height="20px"
        fill={colors.textPrimary}
        my="2px"
      />
      <Box flex="1 1 auto" minWidth="0">
        <Text variant="bo-label" textAlign="left">
          {label}
        </Text>
        {description && (
          <Text variant="bo-helper" mt="2px" textAlign="left">
            {description}
          </Text>
        )}
      </Box>
      {selected && (
        <Icon
          name="check"
          width="20px"
          height="20px"
          fill={colors.teal500}
          my="2px"
        />
      )}
    </Row>
  );
};

export default OptionRow;

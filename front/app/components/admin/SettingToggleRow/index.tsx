import React from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// Toggle centres its label; with a description the toggle sits by the title.
const TopAligned = styled.div`
  .hasLabel {
    align-items: flex-start;
  }
`;

interface Props {
  id?: string;
  title: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

const SettingToggleRow = ({
  id,
  title,
  description,
  checked,
  disabled,
  onChange,
}: Props) => (
  <TopAligned>
    <Toggle
      id={id}
      variant="bo"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      label={
        <Box display="flex" flexDirection="column" gap="2px">
          <Text as="span" variant="boControl" m="0">
            {title}
          </Text>
          {description && (
            <Text as="span" variant="boHelper" m="0">
              {description}
            </Text>
          )}
        </Box>
      }
    />
  </TopAligned>
);

export default SettingToggleRow;

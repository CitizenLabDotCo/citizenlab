import React from 'react';

import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// No Text variant has the 13px / 500 section title this modal uses.
const Title = styled(Text)`
  font-weight: 500;
`;

interface Props {
  title: string;
  tooltip?: string | JSX.Element;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const SettingsSection = ({
  title,
  tooltip,
  description,
  action,
  children,
}: Props) => (
  <Box as="section">
    <Box display="flex" alignItems="flex-start" gap="16px">
      <Box
        display="flex"
        flexDirection="column"
        gap="8px"
        flex="1"
        minWidth="0"
      >
        <Box display="flex" alignItems="center" gap="4px">
          <Title variant="boControl" lineHeight="1.4" m="0px">
            {title}
          </Title>
          {tooltip && <IconTooltip content={tooltip} iconSize="14px" />}
        </Box>
        {description && (
          <Text variant="boMicro" color="coolGrey700" m="0px">
            {description}
          </Text>
        )}
      </Box>
      {action && <Box flexShrink={0}>{action}</Box>}
    </Box>
    {children && <Box mt="12px">{children}</Box>}
  </Box>
);

export default SettingsSection;

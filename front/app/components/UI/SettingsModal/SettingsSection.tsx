import React from 'react';

import {
  Box,
  IconTooltip,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// No Text variant has the 13px / 500 section title this modal uses.
const Title = styled(Text)`
  font-weight: 500;
`;

const Description = styled(Text)`
  a {
    color: inherit;
    text-decoration: underline;
  }
`;

interface Props {
  title: string;
  titleVariant?: 'heading' | 'label';
  tooltip?: string | JSX.Element;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const SettingsSection = ({
  title,
  titleVariant = 'heading',
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
          {titleVariant === 'heading' ? (
            <Title variant="boControl" lineHeight="1.4" m="0px">
              {title}
            </Title>
          ) : (
            <Text
              variant="boMicro"
              color="coolGrey500"
              lineHeight="1.5"
              m="0px"
            >
              {title}
            </Text>
          )}
          {tooltip && (
            <IconTooltip
              content={tooltip}
              icon="info-outline"
              iconSize="14px"
              iconColor={colors.coolGrey500}
            />
          )}
        </Box>
        {description && (
          <Description
            variant="boMicro"
            color="coolGrey700"
            lineHeight="1.5"
            m="0px"
          >
            {description}
          </Description>
        )}
      </Box>
      {action && <Box flexShrink={0}>{action}</Box>}
    </Box>
    {children && <Box mt="12px">{children}</Box>}
  </Box>
);

export default SettingsSection;

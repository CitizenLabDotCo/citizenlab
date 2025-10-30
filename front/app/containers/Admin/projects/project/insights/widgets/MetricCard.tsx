import React from 'react';

import { Box, Text } from 'component-library';
import styled from 'styled-components';

const Card = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.divider};
  border-radius: 4px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MetricValue = styled(Text)`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const MetricLabel = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetricSubtext = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`;

interface Props {
  value: string | number;
  label: string;
  subtext?: string;
  icon?: React.ReactNode;
}

const MetricCard: React.FC<Props> = ({ value, label, subtext, icon }) => {
  return (
    <Card>
      {icon && <Box mb="8px">{icon}</Box>}
      <MetricValue>{value}</MetricValue>
      <MetricLabel>{label}</MetricLabel>
      {subtext && <MetricSubtext>{subtext}</MetricSubtext>}
    </Card>
  );
};

export default MetricCard;

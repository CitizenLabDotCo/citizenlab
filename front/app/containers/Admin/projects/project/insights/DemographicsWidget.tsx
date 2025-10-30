import React from 'react';

import { Box, Title, Text } from 'component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const DemographicCard = styled(Box)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.divider};
  border-radius: 4px;
  padding: 24px;
`;

const DemographicItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};

  &:last-child {
    border-bottom: none;
  }
`;

const DemographicLabel = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const DemographicValue = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const ProgressBar = styled.div<{ percentage: number }>`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.divider};
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${({ percentage }) => percentage}%;
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
  }
`;

interface Props {
  phase?: IPhaseData;
}

const DemographicsWidget = ({ phase: _phase }: Props) => {
  const dummyAgeData = [
    { label: '18-24', value: Math.floor(Math.random() * 30) + 10 },
    { label: '25-34', value: Math.floor(Math.random() * 30) + 15 },
    { label: '35-44', value: Math.floor(Math.random() * 25) + 15 },
    { label: '45-54', value: Math.floor(Math.random() * 20) + 10 },
    { label: '55-64', value: Math.floor(Math.random() * 15) + 10 },
    { label: '65+', value: Math.floor(Math.random() * 15) + 5 },
  ];

  const dummyGenderData = [
    { label: 'Female', value: Math.floor(Math.random() * 20) + 40 },
    { label: 'Male', value: Math.floor(Math.random() * 20) + 35 },
    { label: 'Non-binary', value: Math.floor(Math.random() * 10) + 5 },
    { label: 'Prefer not to say', value: Math.floor(Math.random() * 10) + 5 },
  ];

  return (
    <Box>
      <Title variant="h3" mb="8px">
        <FormattedMessage {...messages.demographicsTitle} />
      </Title>
      <Text color="textSecondary" mb="16px">
        <FormattedMessage {...messages.demographicsDescription} />
      </Text>

      <Box display="flex" gap="24px" flexWrap="wrap">
        <DemographicCard flex="1" minWidth="300px">
          <Title variant="h4" mb="16px">
            <FormattedMessage {...messages.ageDistribution} />
          </Title>
          {dummyAgeData.map((item) => (
            <Box key={item.label} mb="12px">
              <DemographicItem>
                <DemographicLabel>{item.label}</DemographicLabel>
                <DemographicValue>{item.value}%</DemographicValue>
              </DemographicItem>
              <ProgressBar percentage={item.value} />
            </Box>
          ))}
        </DemographicCard>

        <DemographicCard flex="1" minWidth="300px">
          <Title variant="h4" mb="16px">
            <FormattedMessage {...messages.genderDistribution} />
          </Title>
          {dummyGenderData.map((item) => (
            <Box key={item.label} mb="12px">
              <DemographicItem>
                <DemographicLabel>{item.label}</DemographicLabel>
                <DemographicValue>{item.value}%</DemographicValue>
              </DemographicItem>
              <ProgressBar percentage={item.value} />
            </Box>
          ))}
        </DemographicCard>
      </Box>
    </Box>
  );
};

export default DemographicsWidget;

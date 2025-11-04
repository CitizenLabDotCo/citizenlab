import React from 'react';

import { Box, Text } from 'component-library';
import styled from 'styled-components';

import { DemographicDataPoint } from 'api/phase_insights/types';
import useDemographics from 'api/phase_insights/useDemographics';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

// Only using styled components for complex progress bar styling
const SectionTitle = styled(Text)`
  opacity: 0.85;
`;

const ProgressBarRow = styled(Box)`
  background: #f4f6f8;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  position: relative;
  width: 100%;
  height: 26px;
  overflow: hidden;
`;

const ProgressBarFill = styled(Box)<{ percentage: number }>`
  background: rgba(4, 77, 108, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  width: ${({ percentage }) => percentage}%;
  height: 100%;
`;

interface Props {
  phase?: IPhaseData;
}

const DemographicsWidget = ({ phase }: Props) => {
  const { formatMessage } = useIntl();

  // Fetch demographics data using the API hook
  const { data: demographicsData } = useDemographics({
    phaseId: phase?.id || '',
    userDataCollection: phase?.attributes.user_data_collection || 'anonymous',
  });

  const { gender, age, areas } = demographicsData || {};

  // Helper to render a demographic section
  const renderSection = (title: string, data?: DemographicDataPoint[]) => {
    if (!data || data.length === 0) return null;

    return (
      <Box display="flex" flexDirection="column" gap="8px">
        <SectionTitle fontSize="s" fontWeight="semi-bold" color="primary">
          {title}
        </SectionTitle>
        <Box
          display="flex"
          flexDirection="column"
          overflow="hidden"
          borderRadius="2px"
          w="190px"
        >
          {data.map((item, index) => (
            <ProgressBarRow key={`${item.key}-${index}`}>
              <ProgressBarFill percentage={item.percentage}>
                <Text
                  fontSize="s"
                  fontWeight="semi-bold"
                  color="tenantText"
                  m="0px"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  title={`${item.label}: ${
                    item.count
                  } (${item.percentage.toFixed(1)}%)`}
                >
                  {item.label}
                </Text>
              </ProgressBarFill>
            </ProgressBarRow>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box display="flex" gap="24px" minHeight="147px">
      {renderSection(formatMessage(messages.gender), gender)}
      {renderSection(formatMessage(messages.age), age)}
      {renderSection(formatMessage(messages.areas), areas)}
    </Box>
  );
};

export default DemographicsWidget;

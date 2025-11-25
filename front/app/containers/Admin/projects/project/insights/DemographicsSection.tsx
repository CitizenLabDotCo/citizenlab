import React, { useMemo, useState } from 'react';

import { Box, Text, colors, fontSizes } from 'component-library';
import styled, { css } from 'styled-components';

import { transformDemographicsResponse } from 'api/phase_insights/transformDemographics';
import useDemographics from 'api/phase_insights/useDemographics';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import ComparisonBarChart from 'components/admin/Graphs/ComparisonBarChart';
import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
} from 'components/admin/NavigationTabs/tabsStyleConstants';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { useIntl } from 'utils/cl-intl';

import RScore from './audience/RScore';
import { toChartData, toExcelData } from './audience/utils';
import messages from './messages';

// Styled components reusing NavigationTabs constants and styles
const TabsContainer = styled.div`
  display: flex;
  border-bottom: ${tabBorderSize}px solid ${colors.divider};
`;

const TabButton = styled.button<{ active: boolean }>`
  ${({ active }) => css`
    list-style: none;
    display: flex;
    align-items: center;
    margin-bottom: calc(${tabBorderSize}px * -1);
    border: none;
    background: none;
    border-bottom: ${activeBorderSize}px solid transparent;
    margin-right: 40px;
    cursor: pointer;
    color: ${active ? colors.primary : colors.textSecondary};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: ${tabLineHeight}px;
    padding: 0;
    padding-top: ${tabPadding}px;
    padding-bottom: ${tabPadding}px;
    transition: all 100ms ease-out;

    &:first-letter {
      text-transform: uppercase;
    }

    &:hover {
      color: ${colors.primary};
      ${!active && `border-color: #ddd;`}
    }

    ${active &&
    `
      border-color: ${colors.teal500};
      color: ${colors.primary};
    `}
  `}
`;

interface Props {
  phase?: IPhaseData;
}

const DemographicsSection = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);

  // Fetch demographics data in backend format (series/options)
  const { data: response, isLoading } = useDemographics({
    phaseId: phase?.id || '',
    userDataCollection: phase?.attributes.user_data_collection || 'anonymous',
  });

  // Transform backend data to frontend format
  const demographicsData = useMemo(() => {
    if (!response?.data.attributes) return null;
    return transformDemographicsResponse(response.data.attributes, localize);
  }, [response, localize]);

  const fields = useMemo(
    () => demographicsData?.fields || [],
    [demographicsData]
  );
  const selectedField = fields[selectedFieldIndex];

  // Show loading state
  if (isLoading) {
    return (
      <Box
        background="white"
        borderRadius="8px"
        display="flex"
        flexDirection="column"
        gap="24px"
      >
        <Box display="flex" alignItems="center" gap="8px">
          <Text fontSize="m" fontWeight="bold" m="0px">
            {formatMessage(messages.demographicsAndAudience)}
          </Text>
        </Box>
        <Text color="textSecondary">
          {formatMessage(messages.loadingDemographics)}
        </Text>
      </Box>
    );
  }

  // Show empty state if no fields
  if (fields.length === 0) {
    return (
      <Box
        background="white"
        borderRadius="8px"
        display="flex"
        flexDirection="column"
        gap="24px"
      >
        <Box display="flex" alignItems="center" gap="8px">
          <Text fontSize="m" fontWeight="bold" m="0px">
            {formatMessage(messages.demographicsAndAudience)}
          </Text>
        </Box>
        <Text color="textSecondary">
          {formatMessage(messages.noDemographicData)}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      background="white"
      borderRadius="8px"
      display="flex"
      flexDirection="column"
      gap="24px"
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text fontSize="m" fontWeight="bold" m="0px">
          {formatMessage(messages.demographicsAndAudience)}
        </Text>
      </Box>

      {/* Tabs */}
      <TabsContainer>
        {fields.map((field, index) => (
          <TabButton
            key={field.field_id}
            active={selectedFieldIndex === index}
            onClick={() => setSelectedFieldIndex(index)}
            type="button"
          >
            {field.field_name}
          </TabButton>
        ))}
      </TabsContainer>

      {/* Selected field content */}
      <Box display="flex" gap="40px">
        {/* Left side: Chart (60% width) */}
        <Box flexGrow={1} minWidth="0">
          {/* Field name and download button */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="8px"
          >
            <Text fontSize="l" fontWeight="bold" m="0px">
              {selectedField.field_name}
            </Text>
            <ReportExportMenu
              name={selectedField.field_name}
              xlsx={{ data: toExcelData(selectedField) }}
            />
          </Box>

          {/* R.Score */}
          {selectedField.r_score !== undefined && (
            <Box mb="8px">
              <RScore value={selectedField.r_score} />
            </Box>
          )}

          {/* Legend */}
          <Box display="flex" gap="24px" mb="12px">
            <Box display="flex" gap="8px" alignItems="center">
              <Box
                width="8px"
                height="8px"
                borderRadius="50%"
                background="#2f478a"
              />
              <Text fontSize="s" color="coolGrey700" m="0px">
                {formatMessage(messages.participants)}
              </Text>
            </Box>
            <Box display="flex" gap="8px" alignItems="center">
              <Box
                width="8px"
                height="8px"
                borderRadius="50%"
                background="#40b8c5"
              />
              <Text fontSize="s" color="coolGrey700" m="0px">
                {formatMessage(messages.totalPopulation)}
              </Text>
            </Box>
          </Box>

          {/* Chart */}
          <ComparisonBarChart
            data={toChartData(selectedField)}
            mapping={{
              category: 'category',
              primaryValue: 'participants',
              comparisonValue: 'population',
            }}
            primaryColor="#2f478a"
            comparisonColor="#40b8c5"
          />
        </Box>

        {/* Right side: Placeholder for Auto Insights (35% width) */}
        <Box
          width="35%"
          minWidth="300px"
          background="#f7f8f9"
          borderRadius="8px"
          p="16px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="textSecondary" fontSize="s" textAlign="center">
            Auto Insights
            <br />
            Coming soon
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default DemographicsSection;

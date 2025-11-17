import React, { useMemo, useState } from 'react';

import { Box, Text, colors, fontSizes } from 'component-library';
import styled, { css } from 'styled-components';

import { transformDemographicsResponse } from 'api/phase_insights/transformDemographics';
import useDemographics from 'api/phase_insights/useDemographics';
import { IPhaseData } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
} from 'components/admin/NavigationTabs/tabsStyleConstants';

import { useIntl } from 'utils/cl-intl';

import QuestionCard from './audience/QuestionCard';
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
  const currentLocale = useLocale();
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);

  // Fetch demographics data in backend format (series/options)
  const { data: response, isLoading } = useDemographics({
    phaseId: phase?.id || '',
    userDataCollection: phase?.attributes.user_data_collection || 'anonymous',
  });

  // Transform backend data to frontend format
  const demographicsData = useMemo(() => {
    if (!response?.data.attributes) return null;
    return transformDemographicsResponse(
      response.data.attributes,
      currentLocale
    );
  }, [response, currentLocale]);

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
          <QuestionCard field={selectedField} showRepresentativeness={true} />
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

import React, { useMemo, useState } from 'react';

import { Box, Text, colors, fontSizes } from 'component-library';
import styled, { css } from 'styled-components';

import { transformDemographicsResponse } from 'api/phase_insights/transformDemographics';
import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';
import {
  tabLineHeight,
  tabPadding,
  tabBorderSize,
  activeBorderSize,
} from 'components/admin/NavigationTabs/tabsStyleConstants';

import { useIntl } from 'utils/cl-intl';

import DemographicFieldContent from './DemographicFieldContent';
import messages from './messages';
import { usePdfExportContext } from './PdfExportContext';

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

  @media print {
    display: none;
  }
`;

interface Props {
  phase?: IPhaseData;
}

const DemographicsSection = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
  const { isPdfExport } = usePdfExportContext();

  const userDataCollection =
    phase?.attributes.user_data_collection || 'anonymous';

  const { data: response, isLoading } = usePhaseInsights({
    phaseId: phase?.id || '',
  });

  // Transform backend data to frontend format
  // Only show demographics for non-anonymous phases
  const demographicsData = useMemo(() => {
    if (userDataCollection === 'anonymous') return null;
    if (!response?.data.attributes.demographics) return null;
    return transformDemographicsResponse(
      response.data.attributes.demographics,
      localize
    );
  }, [response, localize, userDataCollection]);

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

  // PDF Export mode: wrap header + first field together, then each subsequent field separately
  if (isPdfExport) {
    return (
      <Box
        background="white"
        borderRadius="8px"
        display="flex"
        flexDirection="column"
        gap="24px"
        role="region"
        aria-label={formatMessage(messages.demographicsAndAudience)}
      >
        {/* Header + first field wrapped together to stay on same page */}
        <PageBreakBox>
          <Box display="flex" flexDirection="column" gap="24px">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize="m" fontWeight="bold" m="0px">
                {formatMessage(messages.demographicsAndAudience)}
              </Text>
            </Box>
            <DemographicFieldContent field={fields[0]} showExportMenu={false} />
          </Box>
        </PageBreakBox>

        {/* Remaining fields each get their own PageBreakBox */}
        {fields.slice(1).map((field) => (
          <PageBreakBox key={field.field_id}>
            <DemographicFieldContent field={field} showExportMenu={false} />
          </PageBreakBox>
        ))}
      </Box>
    );
  }

  // Normal view
  return (
    <Box
      background="white"
      borderRadius="8px"
      display="flex"
      flexDirection="column"
      gap="24px"
      role="region"
      aria-label={formatMessage(messages.demographicsAndAudience)}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text fontSize="m" fontWeight="bold" m="0px">
          {formatMessage(messages.demographicsAndAudience)}
        </Text>
      </Box>

      {/* Tabs */}
      <TabsContainer data-pdf-exclude="true">
        {fields.map((field, index) => (
          <TabButton
            key={field.field_id}
            active={selectedFieldIndex === index}
            onClick={() => setSelectedFieldIndex(index)}
            type="button"
            aria-selected={selectedFieldIndex === index}
            role="tab"
          >
            {field.field_name}
          </TabButton>
        ))}
      </TabsContainer>

      {/* Selected field content */}
      <DemographicFieldContent field={selectedField} showExportMenu={true} />
    </Box>
  );
};

export default DemographicsSection;

import React, { useMemo, useState } from 'react';

import {
  Box,
  Text,
  Spinner,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
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

import messages from '../messages';
import { usePdfExportContext } from '../pdf/PdfExportContext';

import DemographicFieldContent from './DemographicFieldContent';

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
      ${!active && `border-color: ${colors.divider};`}
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
  const { isPdfRenderMode } = usePdfExportContext();
  const localize = useLocalize();
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
  const { data: appConfiguration } = useAppConfiguration();

  const privateAttributesInExport =
    appConfiguration?.data.attributes.settings.core
      .private_attributes_in_export !== false;

  const userDataCollection =
    phase?.attributes.user_data_collection || 'anonymous';

  const {
    data: response,
    isLoading,
    error,
  } = usePhaseInsights({
    phaseId: phase?.id || '',
  });

  const blankLabel = formatMessage(messages.noAnswer);
  const demographicsData = useMemo(() => {
    if (userDataCollection === 'anonymous') return null;
    if (!response?.data.attributes.demographics) return null;
    return transformDemographicsResponse(
      response.data.attributes.demographics,
      localize,
      blankLabel
    );
  }, [response, localize, userDataCollection, blankLabel]);

  const fields = useMemo(
    () => demographicsData?.fields || [],
    [demographicsData]
  );
  const selectedField = fields[selectedFieldIndex];

  // Hide demographics when private attributes export is disabled
  if (!privateAttributesInExport) {
    return null;
  }

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
        <Box display="flex" alignItems="center" gap="8px">
          <Spinner size="24px" />
          <Text color="textSecondary" m="0">
            {formatMessage(messages.loadingDemographics)}
          </Text>
        </Box>
      </Box>
    );
  }

  if (error) {
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
        <Text color="error">
          {formatMessage(messages.errorLoadingDemographics)}
        </Text>
      </Box>
    );
  }

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

  if (isPdfRenderMode) {
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

        {fields.slice(1).map((field) => (
          <PageBreakBox key={field.field_id}>
            <DemographicFieldContent field={field} showExportMenu={false} />
          </PageBreakBox>
        ))}
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
      role="region"
      aria-label={formatMessage(messages.demographicsAndAudience)}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text fontSize="m" fontWeight="bold" m="0px">
          {formatMessage(messages.demographicsAndAudience)}
        </Text>
      </Box>

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

      <DemographicFieldContent field={selectedField} showExportMenu={true} />
    </Box>
  );
};

export default DemographicsSection;

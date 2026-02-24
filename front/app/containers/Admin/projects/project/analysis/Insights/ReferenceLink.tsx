import React from 'react';

import { Box, Icon, colors, Tooltip } from '@citizenlab/cl2-component-library';
import { useLocation } from 'utils/router';
import styled from 'styled-components';

import useAnalysis from 'api/analyses/useAnalysis';
import { IInput } from 'api/analysis_inputs/types';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import useLocalize, { Localize } from 'hooks/useLocalize';

import Link from 'utils/cl-router/Link';

const StyledLink = styled(Link)<{ isActive: boolean }>`
  color: ${colors.textPrimary};
  svg {
    transform: scaleX(-1);
    margin-bottom: 4px;
    fill: ${colors.textPrimary};
  }
  :hover {
    svg {
      fill: ${colors.teal500};
    }
  }
  ${({ isActive }) =>
    isActive &&
    `svg {
      fill: ${colors.teal500};
    }`}
`;

const referenceDisplayValue = (
  input: IInput,
  customField: IIdeaCustomField,
  localize: Localize
) => {
  const customFieldValues = input.data.attributes.custom_field_values;
  const customFieldInputType = customField.data.attributes.input_type;
  const customFieldKey = customField.data.attributes.key;
  const titleMultiloc = input.data.attributes.title_multiloc;

  // Localize title multiloc if it's not an empty object {} or undefined
  if (titleMultiloc && Object.keys(titleMultiloc).length > 0) {
    return localize(titleMultiloc);
  }

  if (!customFieldKey) {
    return null;
  }

  if (customFieldInputType === 'select') {
    if (customFieldValues[customFieldKey] === 'other') {
      return customFieldValues[`${customFieldKey}_other`];
    }
  }
  if (customFieldInputType === 'multiselect') {
    if (customFieldValues[customFieldKey]?.includes('other')) {
      return customFieldValues[`${customFieldKey}_other`];
    }
  }
  return customFieldValues[customFieldKey];
};

const ReferenceLink = ({
  match,
  analysisId,
  projectId,
  phaseId,
  selectedInputId,
}: {
  match: string;
  analysisId: string;
  projectId: string;
  phaseId: string;
  selectedInputId: string;
}) => {
  const localize = useLocalize();
  const { pathname } = useLocation();

  const { data: analysis } = useAnalysis(analysisId);
  const { data: input } = useAnalysisInput(analysisId, match);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const mainQuestion = analysis?.data.relationships.main_custom_field?.data?.id;
  const { data: customField } = useIdeaCustomField({
    projectId: phaseId ? undefined : projectId,
    phaseId,
    customFieldId: mainQuestion,
  });

  const mainQuestionResponse =
    input && customField && referenceDisplayValue(input, customField, localize);

  const isAnalysisScreen = pathname.includes('/analysis/');

  return (
    <Tooltip
      content={
        <Box>
          <p>{mainQuestionResponse}</p>
        </Box>
      }
      zIndex={9999}
      placement="top"
      theme="light"
      disabled={!mainQuestionResponse}
    >
      <Box display="inline">
        <StyledLink
          to={`/admin/projects/${projectId}/analysis/${analysisId}?phase_id=${phaseId}&selected_input_id=${match}`}
          isActive={selectedInputId === match}
          target={isAnalysisScreen ? '_self' : '_blank'}
        >
          <Icon name="comment" width="12px" height="12px" />
        </StyledLink>
      </Box>
    </Tooltip>
  );
};

export default ReferenceLink;

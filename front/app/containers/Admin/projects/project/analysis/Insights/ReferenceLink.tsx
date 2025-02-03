import React from 'react';

import { Box, Icon, colors, Tooltip } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import useAnalysis from 'api/analyses/useAnalysis';
import useAnalysisInput from 'api/analysis_inputs/useAnalysisInput';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import useLocalize from 'hooks/useLocalize';

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

const referenceDisplayValue = (input, customField, localize) => {
  const titleMultiloc = input?.data.attributes.title_multiloc;
  if (titleMultiloc && Object.keys(titleMultiloc).length > 0) {
    return localize(titleMultiloc);
  }

  const customFieldKey = customField?.data.attributes.key;
  if (!customFieldKey) {
    return null;
  }
  if (customField?.data.attributes.input_type === 'select') {
    if (
      input?.data.attributes.custom_field_values?.[customFieldKey] === 'other'
    ) {
      return input?.data.attributes.custom_field_values?.[
        `${customFieldKey}_other`
      ];
    }
  }
  if (customField?.data.attributes.input_type === 'multiselect') {
    if (
      input?.data.attributes.custom_field_values?.[customFieldKey].includes(
        'other'
      )
    ) {
      return input?.data.attributes.custom_field_values?.[
        `${customFieldKey}_other`
      ];
    }
  }
  return input?.data.attributes.custom_field_values?.[customFieldKey];
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
  const mainQuestionResponse = referenceDisplayValue(
    input,
    customField,
    useLocalize()
  );
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

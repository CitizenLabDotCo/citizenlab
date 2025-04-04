import React, { useEffect, useState } from 'react';

import {
  Box,
  IconButton,
  colors,
  Dropdown,
  DropdownListItem,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';
import useCustomFields from 'api/custom_fields/useCustomFields';

import useRelevantToHeatmapInputCustomFields from 'containers/Admin/projects/project/analysis/hooks/useRelevantToHeatmapInputCustomFields';

import Button from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../../messages';

import AnalysisInsights from './AnalysisInsights';

const StyledDropdownListItem = styled(DropdownListItem)`
  text-align: left;
`;

const Analysis = ({
  customFieldId,
  textResponsesCount,
  hasOtherResponses,
}: {
  customFieldId: string;
  textResponsesCount: number;
  hasOtherResponses?: boolean;
}) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const { formatMessage } = useIntl();
  const { mutate: addAnalysis, isLoading: isAddAnalysisLoading } =
    useAddAnalysis();
  const { mutate: updateAnalysis, isLoading } = useUpdateAnalysis();

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: analyses, isLoading: isAnalysesLoading } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  const additionalCustomFieldsIds = useRelevantToHeatmapInputCustomFields({
    projectId,
    phaseId,
  })?.map((customField) => customField.id);

  // Needed in order to create stable references for the additional custom fields
  const stringifiedAdditionalCustomFieldsIds = JSON.stringify(
    additionalCustomFieldsIds
  );

  const relevantAnalysis =
    analyses?.data &&
    analyses.data.find(
      (analysis) =>
        analysis.relationships.main_custom_field?.data?.id === customFieldId
    );

  const { data: inputCustomFields } = useCustomFields({
    projectId,
    phaseId,
  });

  const firstTextQuestionId = inputCustomFields?.find(
    (result) =>
      result.input_type === 'text' || result.input_type === 'multiline_text'
  )?.id;

  const { data: insights, isLoading: isInsightsLoading } = useAnalysisInsights({
    analysisId: relevantAnalysis?.id,
  });

  // Create an analysis if there are no analyses yet
  useEffect(() => {
    if (
      analyses &&
      customFieldId &&
      !relevantAnalysis &&
      textResponsesCount > 10
    ) {
      // We are including the additional custom fields in the analysis in order to be able to display heatmaps for them correctly

      addAnalysis({
        projectId: phaseId ? undefined : projectId,
        phaseId,
        mainCustomField: customFieldId,
        additionalCustomFields:
          firstTextQuestionId === customFieldId
            ? JSON.parse(stringifiedAdditionalCustomFieldsIds)
            : undefined,
      });
    }
  }, [
    customFieldId,
    relevantAnalysis,
    analyses,
    projectId,
    phaseId,
    addAnalysis,
    textResponsesCount,
    firstTextQuestionId,
    stringifiedAdditionalCustomFieldsIds,
  ]);

  const toggleDropdown = () => {
    setDropdownOpened(!dropdownOpened);
  };

  const showAnalysisInsights =
    relevantAnalysis && relevantAnalysis.attributes.show_insights;

  const hideAnalysisInsights =
    relevantAnalysis && !relevantAnalysis.attributes.show_insights;

  const noInsights = !relevantAnalysis || insights?.data.length === 0;

  const goToAnalysis = () => {
    if (relevantAnalysis?.id) {
      clHistory.push(
        `/admin/projects/${projectId}/analysis/${
          relevantAnalysis.id
        }?${stringify({
          phase_id: phaseId,
        })}`
      );
    } else {
      addAnalysis(
        {
          projectId: phaseId ? undefined : projectId,
          phaseId,
          mainCustomField: customFieldId,
        },
        {
          onSuccess: (response) => {
            clHistory.push(
              `/admin/projects/${projectId}/analysis/${
                response.data.id
              }?${stringify({ phase_id: phaseId })}`
            );
          },
        }
      );
    }
  };

  if (isAnalysesLoading || (relevantAnalysis?.id && isInsightsLoading)) {
    return <Spinner />;
  }

  return (
    <Box position="relative">
      {noInsights && (
        <Box display="flex">
          <Button
            processing={isAddAnalysisLoading}
            onClick={goToAnalysis}
            buttonStyle="secondary-outlined"
            icon="stars"
          >
            {formatMessage(messages.createAIAnalysis)}
          </Button>
        </Box>
      )}
      {showAnalysisInsights && (
        <>
          <Box
            justifyContent="flex-end"
            position="absolute"
            top="-40px"
            right="0"
            zIndex="1000"
            id="e2e-analysis-actions"
            display={noInsights ? 'none' : 'flex'}
          >
            <IconButton
              iconName="dots-horizontal"
              iconColor={colors.textSecondary}
              iconColorOnHover={colors.black}
              a11y_buttonActionMessage={formatMessage(
                messages.openAnalysisActions
              )}
              onClick={toggleDropdown}
              mr="20px"
            />
            <Dropdown
              opened={dropdownOpened}
              onClickOutside={() => setDropdownOpened(false)}
              content={
                <>
                  <StyledDropdownListItem
                    id="e2e-hide-summaries"
                    onClick={() => {
                      updateAnalysis(
                        {
                          id: relevantAnalysis.id,
                          show_insights: false,
                        },
                        {
                          onSuccess: () => {
                            setDropdownOpened(false);
                          },
                        }
                      );
                    }}
                  >
                    {isLoading ? (
                      <Spinner />
                    ) : (
                      formatMessage(messages.hideSummaries)
                    )}
                  </StyledDropdownListItem>
                </>
              }
            />
          </Box>

          <AnalysisInsights
            analysis={relevantAnalysis}
            hasOtherResponses={hasOtherResponses}
          />
        </>
      )}
      {hideAnalysisInsights && (
        <Box display="flex">
          <Button
            id="e2e-show-summaries"
            processing={isLoading}
            onClick={() =>
              updateAnalysis({
                id: relevantAnalysis.id,
                show_insights: true,
              })
            }
            buttonStyle="secondary-outlined"
            icon="stars"
          >
            {formatMessage(messages.showSummaries)}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Analysis;

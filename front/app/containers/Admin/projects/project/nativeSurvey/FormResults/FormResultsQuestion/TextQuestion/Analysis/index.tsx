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

import Button from 'components/UI/Button';

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
}: {
  customFieldId: string;
  textResponsesCount: number;
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

  const relevantAnalysis =
    analyses?.data &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    analyses?.data?.find(
      (analysis) =>
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        analysis.relationships.main_custom_field?.data?.id === customFieldId
    );
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
      addAnalysis({
        projectId: phaseId ? undefined : projectId,
        phaseId,
        mainCustomField: customFieldId,
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

          <AnalysisInsights analysis={relevantAnalysis} />
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

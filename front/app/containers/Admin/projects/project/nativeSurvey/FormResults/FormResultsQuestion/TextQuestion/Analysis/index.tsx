import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  IconButton,
  colors,
  Dropdown,
  DropdownListItem,
  Spinner,
} from '@citizenlab/cl2-component-library';

import useAnalyses from 'api/analyses/useAnalyses';
import { useParams } from 'react-router-dom';

import AnalysisInsights from './AnalysisInsights';
import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import messages from '../../../messages';
import { useIntl } from 'utils/cl-intl';
import styled from 'styled-components';

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
  const { mutate: addAnalysis } = useAddAnalysis();
  const { mutate: updateAnalysis, isLoading } = useUpdateAnalysis();

  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: analyses } = useAnalyses({
    projectId: phaseId ? undefined : projectId,
    phaseId,
  });

  const relevantAnalysis =
    analyses?.data &&
    analyses?.data?.find(
      (analysis) =>
        analysis.relationships.main_custom_field?.data.id === customFieldId
    );

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

  return (
    <Box position="relative">
      {relevantAnalysis && relevantAnalysis.attributes.show_insights && (
        <>
          <Box
            display="flex"
            justifyContent="flex-end"
            position="absolute"
            top="-40px"
            right="0"
            zIndex="1000"
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
      {relevantAnalysis && !relevantAnalysis.attributes.show_insights && (
        <Box display="flex">
          <Button
            processing={isLoading}
            onClick={() =>
              updateAnalysis({
                id: relevantAnalysis.id,
                show_insights: true,
              })
            }
            buttonStyle="secondary"
            icon="flash"
          >
            {formatMessage(messages.showSummaries)}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Analysis;

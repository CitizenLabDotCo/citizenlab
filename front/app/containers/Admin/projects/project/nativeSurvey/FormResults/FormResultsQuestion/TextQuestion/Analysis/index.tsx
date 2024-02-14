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

const Analysis = ({ customFieldId }: { customFieldId: string }) => {
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
    analyses?.data?.find((analysis) =>
      analysis.relationships.custom_fields.data.some(
        (field) => field.id === customFieldId
      )
    );

  // Create an analysis if there are no analyses yet
  useEffect(() => {
    if (analyses && customFieldId && !relevantAnalysis) {
      addAnalysis({
        projectId: phaseId ? undefined : projectId,
        phaseId,
        customFieldIds: [customFieldId],
      });
    }
  }, [
    customFieldId,
    relevantAnalysis,
    analyses,
    projectId,
    phaseId,
    addAnalysis,
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
            top="0"
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
                  <DropdownListItem
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
                  </DropdownListItem>
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

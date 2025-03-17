import React from 'react';

import { Box, colors, Text, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { Unit } from 'api/analysis_heat_map_cells/types';
import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHetmapCells';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface HeatMapInsightsProps {
  onExploreClick: ({
    unit,
    customFieldOptionId,
  }: {
    unit: Unit;
    customFieldOptionId?: string;
  }) => void;
}

const HeatMapInsights = ({ onExploreClick }: HeatMapInsightsProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };

  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
    maxPValue: 0.05,
    pageSize: 12,
  });

  if (!analysisHeatmapCells) return null;

  if (analysisHeatmapCells.data.length === 0) {
    return (
      <Box display="flex" justifyContent="center">
        <Button
          buttonStyle="text"
          icon="eye"
          size="s"
          p="0px"
          onClick={() =>
            onExploreClick({
              unit: 'inputs',
            })
          }
        >
          {formatMessage(messages.viewAllInsights)}
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Text fontWeight="bold">
        {formatMessage(messages.demographicInsights)}
      </Text>
      {analysisHeatmapCells.data.map((cell) => (
        <Box
          key={cell.id}
          px="12px"
          py="12px"
          my="12px"
          bg={colors.teal50}
          borderRadius="3px"
        >
          <Text>{localize(cell.attributes.statement_multiloc)}</Text>
          {cell.attributes.unit === 'inputs' && (
            <Box display="flex">
              <Button
                buttonStyle="text"
                icon="eye"
                size="s"
                p="0px"
                onClick={() =>
                  onExploreClick({
                    unit: cell.attributes.unit,
                    customFieldOptionId: cell.relationships.column?.data.id,
                  })
                }
              >
                {formatMessage(messages.explore)}
              </Button>
            </Box>
          )}
        </Box>
      ))}
    </>
  );
};

export default HeatMapInsights;

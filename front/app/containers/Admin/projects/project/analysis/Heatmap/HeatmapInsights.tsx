import React from 'react';

import { Box, colors, Text, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { IAnalysysHeatmapCellsParams } from 'api/analysis_heat_map_cells/types';
import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHetmapCells';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface HeatMapInsightsProps {
  onReadMoreClick: ({
    unit,
    customFieldOptionId,
  }: {
    unit: IAnalysysHeatmapCellsParams['unit'];
    customFieldOptionId?: string;
  }) => void;
}

const HeatMapInsights = ({ onReadMoreClick }: HeatMapInsightsProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };

  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
    maxPValue: 0.05,
    pageSize: 2,
  });

  if (!analysisHeatmapCells) return null;

  return (
    <>
      {analysisHeatmapCells.data.map((cell) => (
        <Box
          key={cell.id}
          px="12px"
          py="12px"
          my="12px"
          bg={colors.teal100}
          borderRadius="3px"
        >
          <Text>{localize(cell.attributes.statement_multiloc)}</Text>
          <Box display="flex">
            <Button
              buttonStyle="text"
              icon="eye"
              size="s"
              p="0px"
              onClick={() =>
                onReadMoreClick({
                  unit: cell.attributes.unit,
                  customFieldOptionId: cell.relationships.column?.data.id,
                })
              }
            >
              {formatMessage(messages.readMore)}
            </Button>
          </Box>
        </Box>
      ))}
    </>
  );
};

export default HeatMapInsights;

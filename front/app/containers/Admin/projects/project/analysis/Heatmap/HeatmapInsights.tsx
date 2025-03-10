import React from 'react';

import { Box, colors, Text, Button } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHetmapCells';

import useLocalize from 'hooks/useLocalize';

interface HeatMapInsightsProps {
  onReadMoreClick: () => void;
}

const HeatMapInsights = ({ onReadMoreClick }: HeatMapInsightsProps) => {
  const localize = useLocalize();
  const { analysisId } = useParams() as { analysisId: string };

  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
    maxPValue: 0.05,
    pageSize: 1,
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
              onClick={onReadMoreClick}
            >
              Read more
            </Button>
          </Box>
        </Box>
      ))}
    </>
  );
};

export default HeatMapInsights;

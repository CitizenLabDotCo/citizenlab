import React, { useEffect, useState } from 'react';

import {
  Box,
  colors,
  Text,
  Button,
  IconButton,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { Unit } from 'api/analysis_heat_map_cells/types';
import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHeatmapCells';
import useCustomFieldBin from 'api/custom_field_bins/useCustomFieldBin';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface HeatMapInsightsProps {
  onExploreClick: ({
    unit,
    customFieldId,
  }: {
    unit: Unit;
    customFieldId?: string;
  }) => void;
}

const HeatMapInsights = ({ onExploreClick }: HeatMapInsightsProps) => {
  const [selectedInsightId, setSelectedInsightId] = useState<
    string | undefined
  >();

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const { analysisId } = useParams() as { analysisId: string };

  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
    maxPValue: 0.05,
    pageSize: 12,
  });

  const selectedCell = analysisHeatmapCells?.data.find(
    (cell) => cell.id === selectedInsightId
  );

  const { data: bin } = useCustomFieldBin({
    binId: selectedCell?.relationships.column.data.id,
  });

  useEffect(() => {
    if (analysisHeatmapCells && analysisHeatmapCells.data.length > 0) {
      setSelectedInsightId(analysisHeatmapCells.data[0].id);
    }
  }, [analysisHeatmapCells]);

  if (!analysisHeatmapCells) return <Spinner />;

  const handleChangeInsight = (offset: number) => {
    setSelectedInsightId((currentId) => {
      const insights = analysisHeatmapCells.data;
      const currentIndex = insights.findIndex(
        (field) => field.id === currentId
      );
      const length = insights.length;

      // Calculate new index with wraparound
      let newIndex = (currentIndex + offset) % length;
      if (newIndex < 0) newIndex += length;

      return insights[newIndex].id;
    });
  };

  if (analysisHeatmapCells.data.length === 0) {
    return (
      <Box display="flex" justifyContent="center">
        <Button
          my="12px"
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

  if (analysisHeatmapCells.data.length === 0) {
    return (
      <Box display="flex" justifyContent="center">
        <Button
          my="12px"
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
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text fontWeight="bold">
          {formatMessage(messages.demographicInsights)}
        </Text>
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <IconButton
            iconName="chevron-left"
            onClick={() => handleChangeInsight(-1)}
            a11y_buttonActionMessage={formatMessage(messages.previousInsight)}
            iconColor={colors.grey600}
            iconColorOnHover={colors.grey700}
            iconWidth="20px"
          />
          {selectedInsightId && (
            <Text mx="8px">
              {analysisHeatmapCells.data.findIndex(
                (cell) => cell.id === selectedInsightId
              ) + 1}
              /{analysisHeatmapCells.data.length}
            </Text>
          )}
          <IconButton
            iconName="chevron-right"
            onClick={() => handleChangeInsight(1)}
            a11y_buttonActionMessage={formatMessage(messages.nextInsight)}
            iconColor={colors.grey600}
            iconColorOnHover={colors.grey700}
            iconWidth="20px"
          />
        </Box>
      </Box>
      {selectedCell && (
        <Box
          key={selectedCell.id}
          px="12px"
          py="12px"
          bg={colors.teal50}
          borderRadius="3px"
        >
          <Text>{localize(selectedCell.attributes.statement_multiloc)}</Text>
          <Box display="flex">
            <Button
              buttonStyle="text"
              icon="eye"
              size="s"
              p="0px"
              onClick={() =>
                onExploreClick({
                  unit: selectedCell.attributes.unit,
                  customFieldId: bin?.data.relationships.custom_field.data.id,
                })
              }
            >
              {formatMessage(messages.explore)}
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default HeatMapInsights;

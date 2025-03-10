import React from 'react';

import {
  Box,
  colors,
  Table,
  Thead,
  Tr,
  Td,
  Tbody,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHetmapCells';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';

interface HeatMapProps {
  onClose: () => void;
}

const HeatmapDetails = ({ onClose }: HeatMapProps) => {
  const localize = useLocalize();
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
  });

  const { data: tags } = useAnalysisTags({
    analysisId,
  });

  const { data: genderCustomField } = useUserCustomField(
    '6106ebc9-0b9c-43e1-af24-04a2bdbaa26c'
  );

  const { data: options } = useUserCustomFieldsOptions(
    '6106ebc9-0b9c-43e1-af24-04a2bdbaa26c'
  );

  return (
    <Box
      position="absolute"
      top="85px"
      left="0"
      width="1380px"
      height="100vh"
      zIndex="100000000"
      overflow="scroll"
      bg="white"
    >
      <CloseIconButton onClick={onClose} />
      <Table>
        <Thead>
          <Tr>
            <Td />
            {options?.data.map((option) => (
              <Td key={option.id}>
                {localize(option.attributes.title_multiloc)}
              </Td>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {tags?.data.map((tag) => (
            <Tr key={tag.id}>
              <Td>{tag.attributes.name}</Td>
              {options?.data.map((option) => {
                const cell = analysisHeatmapCells?.data.find(
                  (cell) =>
                    cell.relationships.row?.data.id === tag.id &&
                    cell.relationships.column?.data.id === option.id
                );

                const lift = cell?.attributes.lift;
                const pValue = cell?.attributes.p_value;
                const isSignificant = pValue !== undefined && pValue <= 0.05;

                return (
                  <Td
                    key={option.id}
                    bgColor={
                      lift !== undefined
                        ? lift > 1
                          ? colors.successLight
                          : colors.errorLight
                        : 'white'
                    }
                  >
                    {lift !== undefined ? lift.toFixed(2) : null}
                    {isSignificant ? ' *' : ''}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default HeatmapDetails;

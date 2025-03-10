import React, { useState } from 'react';

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
import { IUserCustomFields } from 'api/user_custom_fields/types';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';

interface HeatMapProps {
  onClose: () => void;
  customFields: IUserCustomFields;
}

interface CustomFieldOptionsProps {
  customFieldId: string;
}

const CustomFieldOptions: React.FC<CustomFieldOptionsProps> = ({
  customFieldId,
}) => {
  const { data: options } = useUserCustomFieldsOptions(customFieldId);
  const localize = useLocalize();

  return (
    <>
      {' '}
      {options?.data.map((option) => (
        <Td key={option.id}>{localize(option.attributes.title_multiloc)}</Td>
      ))}
    </>
  );
};

const HeatmapDetails = ({ onClose, customFields }: HeatMapProps) => {
  const [selectedFieldId, setSelectedFieldId] = useState(
    customFields.data[0].id
  );
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
    columnCategoryType: 'user_custom_field',
    columnCategoryTypeId: selectedFieldId,
  });

  const { data: tags } = useAnalysisTags({
    analysisId,
  });

  const { data: options } = useUserCustomFieldsOptions(selectedFieldId);

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
            <CustomFieldOptions customFieldId={selectedFieldId} />
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

import React, { useState } from 'react';

import {
  Box,
  colors,
  Table,
  Thead,
  Tr,
  Td,
  Tbody,
  stylingConsts,
  Title,
  IconButton,
  Th,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHetmapCells';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import { IUserCustomFields } from 'api/user_custom_fields/types';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';

import Tag from '../Tags/Tag';

interface HeatMapProps {
  onClose: () => void;
  customFields: IUserCustomFields;
}

interface CustomFieldOptionsProps {
  customFieldId: string;
}

const StyledTable = styled(Table)`
  table-layout: fixed;

  /* Set first column width */
  & th:first-child,
  & td:first-child {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  /* Make other columns share remaining space evenly */
  & th:not(:first-child),
  & td:not(:first-child) {
    width: auto;
  }
  /* Make the table support sticky positioning */
  border-collapse: separate;
  border-spacing: 0;

  /* Make thead sticky */
  & thead th {
    position: sticky;
    top: 0;
    background-color: ${colors.white};
    z-index: 10;
  }

  /* Make first column sticky */
  & tr th:first-child,
  & tr td:first-child {
    position: sticky;
    left: 0;
    z-index: 5;
  }

  /* Increase z-index for the corner cell (thead first cell) */
  & thead th:first-child {
    z-index: 15;
  }

  /* Add striped rows */
  & tbody tr:nth-child(odd) td {
    background-color: ${colors.white};
  }

  & tbody tr:nth-child(even) td {
    background-color: ${colors.grey100};
  }
`;

const CustomFieldOptions: React.FC<CustomFieldOptionsProps> = ({
  customFieldId,
}) => {
  const { data: options } = useUserCustomFieldsOptions(customFieldId);
  const localize = useLocalize();

  return (
    <>
      {options?.data.map((option) => (
        <Th key={option.id}>{localize(option.attributes.title_multiloc)}</Th>
      ))}
    </>
  );
};

const HeatmapDetails = ({ onClose, customFields }: HeatMapProps) => {
  const localize = useLocalize();
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

  const { data: customField } = useUserCustomField(selectedFieldId);
  const { data: options } = useUserCustomFieldsOptions(selectedFieldId);

  const handleChangeCustomField = (offset: number) => {
    setSelectedFieldId((currentId) => {
      const fields = customFields.data;
      const currentIndex = fields.findIndex((field) => field.id === currentId);
      const length = fields.length;

      // Calculate new index with wraparound
      let newIndex = (currentIndex + offset) % length;
      if (newIndex < 0) newIndex += length;

      return fields[newIndex].id;
    });
  };

  return (
    <Box
      position="absolute"
      top={`${stylingConsts.mobileMenuHeight + 12}px`}
      left="0"
      // The width is calculated so that is overlaps 3 out of the 4 columns on the screen.
      // The last column remains visible so that AI insights remain visible.
      width="calc(300px + (100% - 300px - 24px) * 2/3)"
      height="100vh"
      zIndex="100000000"
      bg={colors.white}
    >
      <Box display="flex" justifyContent="flex-end" py="12px">
        <CloseIconButton onClick={onClose} />
      </Box>
      <Box display="flex" justifyContent="space-between" w="80%" m="auto">
        <IconButton
          iconName="arrow-left"
          onClick={() => handleChangeCustomField(-1)}
          a11y_buttonActionMessage={''}
        />
        <Title>{localize(customField?.data.attributes.title_multiloc)}</Title>

        <IconButton
          iconName="arrow-right"
          onClick={() => handleChangeCustomField(1)}
          a11y_buttonActionMessage={''}
        />
      </Box>
      <Box overflowX="auto" w="100%" h="100%" pb="220px">
        <StyledTable>
          <Thead>
            <Tr>
              <Th />
              <CustomFieldOptions customFieldId={selectedFieldId} />
            </Tr>
          </Thead>
          <Tbody>
            {tags?.data.map((tag) => (
              <Tr key={tag.id}>
                <Td>
                  <Tag
                    name={tag.attributes.name}
                    tagType={tag.attributes.tag_type}
                  />
                </Td>
                {options?.data.map((option) => {
                  const cell = analysisHeatmapCells?.data.find(
                    (cell) =>
                      cell.relationships.row?.data.id === tag.id &&
                      cell.relationships.column?.data.id === option.id
                  );

                  const lift = cell?.attributes.lift;
                  const pValue = cell?.attributes.p_value;
                  const isSignificant = pValue !== undefined && pValue <= 0.05;

                  const cellBgColor =
                    lift !== undefined
                      ? lift > 1
                        ? colors.successLight
                        : colors.errorLight
                      : colors.grey200;

                  return (
                    <Td key={option.id}>
                      <Box
                        borderRadius={stylingConsts.borderRadius}
                        bgColor={cellBgColor}
                        p="8px"
                        w="fit-content"
                      >
                        {lift !== undefined ? lift.toFixed(2) : null}
                        {isSignificant ? ' *' : ''}
                      </Box>
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </StyledTable>
      </Box>
    </Box>
  );
};

export default HeatmapDetails;

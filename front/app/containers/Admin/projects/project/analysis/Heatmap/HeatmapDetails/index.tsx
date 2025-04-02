import React, { useState } from 'react';

import {
  Box,
  colors,
  Table,
  Tr,
  Td,
  Tbody,
  stylingConsts,
  Title,
  Select,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { Unit } from 'api/analysis_heat_map_cells/types';
import useAnalysisHeatmapCells from 'api/analysis_heat_map_cells/useAnalysisHeatmapCells';
import useAnalysisTags from 'api/analysis_tags/useAnalysisTags';
import useCustomFieldBins from 'api/custom_field_bins/useCustomFieldBins';
import { IFlatCustomField } from 'api/custom_fields/types';
import { IUserCustomFieldData } from 'api/user_custom_fields/types';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';

import { useIntl } from 'utils/cl-intl';

import Tag from '../../Tags/Tag';
import messages from '../messages';

import HeatmapCellTagVsBin from './HeatmapCellTagVsBin';
import HeatmapTableHead from './HeatmapTableHead';

interface StyledTableProps {
  columns: number;
}

const StyledTable = styled(Table)<StyledTableProps>`
  table-layout: fixed;
  // Set the min-width to the sum of the first column width and the rest of the columns
  min-width: ${({ columns }) => `${200 + 120 * columns}px`};

  /* Set first column width */
  & th:first-child,
  & td:first-child {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

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
    text-align: center;
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

interface HeatMapProps {
  onClose: () => void;
  userCustomFields: IUserCustomFieldData[];
  inputCustomFields: IFlatCustomField[];
  initialCustomFieldId?: string;
  initialUnit?: Unit;
}

const HeatmapDetails = ({
  onClose,
  userCustomFields,
  inputCustomFields,
  initialCustomFieldId,
  initialUnit,
}: HeatMapProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const userCustomFieldsIds = userCustomFields.map(
    (customField) => customField.id
  );
  const inputCustomFieldsIds = inputCustomFields.map(
    (customField) => customField.id
  );
  const [selectedColumnFieldId, setSelectedColumnFieldId] = useState(
    initialCustomFieldId || userCustomFieldsIds[0]
  );
  const [selectedRowFieldId, setSelectedRowFieldId] = useState(
    initialCustomFieldId || userCustomFieldsIds[0]
  );

  const [unit, setUnit] = useState<Unit>(initialUnit || 'inputs');
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysisHeatmapCells } = useAnalysisHeatmapCells({
    analysisId,
    columnCategoryType: 'input_custom_field',
    columnCategoryId: selectedColumnFieldId,
    rowCategoryType: 'input_custom_field',
    rowCategoryId: selectedRowFieldId,
    unit,
  });

  const { data: tags } = useAnalysisTags({
    analysisId,
  });

  const { data: customField } = useUserCustomField(selectedColumnFieldId);
  const { data: options } = useUserCustomFieldsOptions(selectedColumnFieldId);
  const { data: bins } = useCustomFieldBins(selectedColumnFieldId);

  if (!options || !bins) return null;

  return (
    <Box
      position="absolute"
      top={`${stylingConsts.mobileMenuHeight + 12}px`}
      left="0"
      // The width is calculated so that is overlaps 3 out of the 4 columns on the screen.
      // The last column remains visible so that AI insights remain visible.
      width="calc(300px + (100% - 300px - 12px) * 2/3)"
      height="100vh"
      zIndex="100000"
      bg={colors.white}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        py="12px"
        position="absolute"
        top="0"
        right="12px"
      >
        <CloseIconButton onClick={onClose} />
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        gap="12px"
        flexWrap="wrap"
        mt="40px"
        mb="12px"
      >
        <Select
          size="small"
          label={formatMessage(messages.columnValues)}
          value={selectedColumnFieldId}
          onChange={(option) => setSelectedColumnFieldId(option.value)}
          options={[
            ...userCustomFields.map((field) => ({
              value: field.id,
              label: localize(field.attributes.title_multiloc),
            })),
            ...inputCustomFields.map((field) => ({
              value: field.id,
              label: localize(field.title_multiloc),
            })),
          ]}
        />

        <Select
          size="small"
          label={formatMessage(messages.rowValues)}
          value={
            inputCustomFieldsIds.includes(selectedRowFieldId)
              ? selectedRowFieldId
              : inputCustomFieldsIds[0]
          }
          onChange={(option) => setSelectedRowFieldId(option.value)}
          options={inputCustomFields.map((field) => ({
            value: field.id,
            label: localize(field.title_multiloc),
          }))}
          disabled={inputCustomFieldsIds.length === 0}
        />

        <Select
          size="small"
          value={unit}
          label={formatMessage(messages.units)}
          onChange={(option) => setUnit(option.value)}
          options={[
            { value: 'inputs', label: formatMessage(messages.inputs) },
            { value: 'likes', label: formatMessage(messages.likes) },
            { value: 'dislikes', label: formatMessage(messages.dislikes) },
            {
              value: 'participants',
              label: formatMessage(messages.participants),
            },
          ]}
        />
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Title fontSize="xl">
          {localize(customField?.data.attributes.title_multiloc)}
        </Title>
      </Box>
      <Box overflowX="auto" w="100%" h="100%" pb="220px">
        {/* The number of columns includes the number of options + the tags column  */}
        <StyledTable columns={options.data.length + 2}>
          <HeatmapTableHead customFieldId={selectedColumnFieldId} />

          <Tbody>
            {tags?.data.map((tag) => (
              <Tr key={tag.id}>
                <Td>
                  <Box maxWidth="200px">
                    <Tag
                      name={tag.attributes.name}
                      tagType={tag.attributes.tag_type}
                    />
                  </Box>
                </Td>
                {bins.data.map((bin) => {
                  const cell = analysisHeatmapCells?.data.find(
                    (cell) =>
                      cell.relationships.row.data.id === tag.id &&
                      cell.relationships.column.data.id === bin.id
                  );

                  return (
                    <Td key={bin.id}>
                      <HeatmapCellTagVsBin cell={cell} tag={tag} bin={bin} />
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

import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { ICustomFieldInputType } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { getCustomFieldBadgeLabel } from '../FormFields/utils';

import messages from './messages';

const INPUT_TYPES = [
  'page',
  'text',
  'multiline_text',
  'number',
  'select',
  'multiselect',
  'multiselect_image',
  'ranking',
  'linear_scale',
  'rating',
  'matrix_linear_scale',
  'sentiment_linear_scale',
  'file_upload',
  'shapefile_upload',
  'point',
  'line',
  'polygon',
] as const satisfies readonly ICustomFieldInputType[];

type OutlineField = {
  key: string;
  inputType: (typeof INPUT_TYPES)[number];
  title: Multiloc;
  required: boolean;
  formEnd: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isInputType = (value: unknown): value is OutlineField['inputType'] =>
  INPUT_TYPES.some((inputType) => inputType === value);

const isMultiloc = (value: unknown): value is Multiloc =>
  isRecord(value) &&
  Object.values(value).every((text) => typeof text === 'string');

// The proposed arguments come from the model: keep only the fields that look valid.
const toOutlineFields = (fields: unknown): OutlineField[] =>
  Array.isArray(fields)
    ? fields.flatMap((field, index) =>
        isRecord(field) && isInputType(field.input_type)
          ? [
              {
                // New fields have no id yet.
                key: typeof field.id === 'string' ? field.id : `new-${index}`,
                inputType: field.input_type,
                title: isMultiloc(field.title_multiloc)
                  ? field.title_multiloc
                  : {},
                required: field.required === true,
                formEnd: field.key === 'form_end',
              },
            ]
          : []
      )
    : [];

type Props = {
  args: Record<string, unknown>;
};

// Outline of the survey proposed by the replace_form_fields tool.
const FormOutlinePreview = ({ args }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const fields = toOutlineFields(args.fields);
  const isPage = (field: OutlineField) =>
    field.inputType === 'page' && !field.formEnd;
  const pageCount = fields.filter(isPage).length;
  const questionCount = fields.filter(
    (field) => field.inputType !== 'page'
  ).length;

  return (
    <Box display="flex" flexDirection="column" gap="4px">
      <Text m="0px" fontSize="s" color="textSecondary">
        <FormattedMessage
          {...messages.outlineSummary}
          values={{ pages: pageCount, questions: questionCount }}
        />
      </Text>
      {fields.map((field, index) => {
        const title = localize(field.title);

        if (field.inputType === 'page') {
          const pageNumber = fields.slice(0, index + 1).filter(isPage).length;
          return (
            <Text key={field.key} m="0px" mt="8px" fontWeight="bold">
              {field.formEnd
                ? formatMessage(messages.endPage)
                : title ||
                  formatMessage(messages.pageNumber, { number: pageNumber })}
            </Text>
          );
        }

        return (
          <Box
            key={field.key}
            pl="12px"
            borderLeft={`2px solid ${colors.borderLight}`}
          >
            <Text m="0px">{title || formatMessage(messages.untitled)}</Text>
            <Text m="0px" fontSize="xs" color="textSecondary">
              {formatMessage(getCustomFieldBadgeLabel(field.inputType))}
              {field.required && ` · ${formatMessage(messages.required)}`}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default FormOutlinePreview;

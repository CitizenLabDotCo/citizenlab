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

type InputType = (typeof INPUT_TYPES)[number];

type OutlineItem =
  | { kind: 'page'; key: string; title: Multiloc; number: number }
  | { kind: 'endPage'; key: string }
  | {
      kind: 'question';
      key: string;
      title: Multiloc;
      inputType: InputType;
      required: boolean;
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isInputType = (value: unknown): value is InputType =>
  INPUT_TYPES.some((inputType) => inputType === value);

const isMultiloc = (value: unknown): value is Multiloc =>
  isRecord(value) &&
  Object.values(value).every((text) => typeof text === 'string');

// The proposed arguments come from the model: fields that don't look valid are skipped.
const toOutline = (fields: unknown): OutlineItem[] => {
  if (!Array.isArray(fields)) return [];

  const outline: OutlineItem[] = [];
  let pageNumber = 0;

  fields.forEach((field: unknown, index: number) => {
    if (!isRecord(field) || !isInputType(field.input_type)) return;

    // New fields have no id yet.
    const key = typeof field.id === 'string' ? field.id : `new-${index}`;
    const title = isMultiloc(field.title_multiloc) ? field.title_multiloc : {};

    if (field.input_type !== 'page') {
      outline.push({
        kind: 'question',
        key,
        title,
        inputType: field.input_type,
        required: field.required === true,
      });
    } else if (field.key === 'form_end') {
      outline.push({ kind: 'endPage', key });
    } else {
      pageNumber += 1;
      outline.push({ kind: 'page', key, title, number: pageNumber });
    }
  });

  return outline;
};

type Props = {
  args: Record<string, unknown>;
};

// Outline of the survey proposed by the replace_form_fields tool.
const FormOutlinePreview = ({ args }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const outline = toOutline(args.fields);
  const pageCount = outline.filter((item) => item.kind === 'page').length;
  const questionCount = outline.filter(
    (item) => item.kind === 'question'
  ).length;

  return (
    <Box display="flex" flexDirection="column" gap="4px">
      <Text m="0px" fontSize="s" color="textSecondary">
        <FormattedMessage
          {...messages.outlineSummary}
          values={{ pages: pageCount, questions: questionCount }}
        />
      </Text>
      {outline.map((item) => {
        if (item.kind === 'endPage') {
          return (
            <Text key={item.key} m="0px" mt="8px" fontWeight="bold">
              {formatMessage(messages.endPage)}
            </Text>
          );
        }

        if (item.kind === 'page') {
          return (
            <Text key={item.key} m="0px" mt="8px" fontWeight="bold">
              {localize(item.title) ||
                formatMessage(messages.pageNumber, { number: item.number })}
            </Text>
          );
        }

        return (
          <Box
            key={item.key}
            pl="12px"
            borderLeft={`2px solid ${colors.borderLight}`}
          >
            <Text m="0px">
              {localize(item.title) || formatMessage(messages.untitled)}
            </Text>
            <Text m="0px" fontSize="xs" color="textSecondary">
              {formatMessage(getCustomFieldBadgeLabel(item.inputType))}
              {item.required && ` · ${formatMessage(messages.required)}`}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default FormOutlinePreview;

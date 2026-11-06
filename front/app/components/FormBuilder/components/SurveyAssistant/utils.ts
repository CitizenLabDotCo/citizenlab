import { Multiloc } from 'typings';

import { ICustomFieldInputType } from 'api/custom_fields/types';

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
export const toOutline = (fields: unknown): OutlineItem[] => {
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

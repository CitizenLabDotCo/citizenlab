import { IFlatCustomField } from 'api/custom_fields/types';

import { replaceIdsWithNewUuids, replaceUuidsInText } from './utils';

const field = (
  attributes: Partial<IFlatCustomField> &
    Pick<IFlatCustomField, 'id' | 'input_type'>
): IFlatCustomField => ({
  type: 'custom_field',
  key: attributes.id,
  title_multiloc: {},
  description_multiloc: {},
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  ...attributes,
});

const pageOne = field({
  id: 'page-1',
  input_type: 'page',
  logic: { next_page_id: 'page-3' },
});
const select = field({
  id: 'select-q',
  input_type: 'select',
  options: [
    { id: 'option-a', key: 'a', title_multiloc: {} },
    { id: 'option-b', key: 'b', title_multiloc: {} },
  ],
  logic: {
    rules: [
      { if: 'option-a', goto_page_id: 'page-2' },
      { if: 'any_other_answer', goto_page_id: 'page-3' },
      { if: 'no_answer', goto_page_id: 'page-end' },
    ],
  },
});
const pageTwo = field({ id: 'page-2', input_type: 'page' });
const scale = field({
  id: 'scale-q',
  input_type: 'linear_scale',
  maximum: 5,
  logic: { rules: [{ if: 3, goto_page_id: 'page-end' }] },
});
const pageThree = field({ id: 'page-3', input_type: 'page' });
const endPage = field({ id: 'page-end', key: 'form_end', input_type: 'page' });

const fields = [pageOne, select, pageTwo, scale, pageThree, endPage];

const idAt = (result: IFlatCustomField[], index: number) => result[index].id;

describe('replaceIdsWithNewUuids', () => {
  it('gives every field and option a new id', () => {
    const result = replaceIdsWithNewUuids(fields);
    const oldIds = new Set(fields.map((f) => f.id));

    result.forEach((f) => expect(oldIds.has(f.id)).toBe(false));
    expect(result[1].options?.map((option) => option.id)).not.toContain(
      'option-a'
    );
    expect(new Set(result.map((f) => f.id)).size).toBe(fields.length);
  });

  it('points page default next pages to the new page ids', () => {
    const result = replaceIdsWithNewUuids(fields);

    expect(result[0].logic).toEqual({ next_page_id: idAt(result, 4) });
  });

  it('points question rules to the new option and page ids', () => {
    const result = replaceIdsWithNewUuids(fields);
    const newOptionA = result[1].options?.[0].id;

    expect(result[1].logic.rules).toEqual([
      { if: newOptionA, goto_page_id: idAt(result, 2) },
      { if: 'any_other_answer', goto_page_id: idAt(result, 4) },
      { if: 'no_answer', goto_page_id: idAt(result, 5) },
    ]);
  });

  it('keeps integer scale values in rules', () => {
    const result = replaceIdsWithNewUuids(fields);

    expect(result[3].logic.rules).toEqual([
      { if: 3, goto_page_id: idAt(result, 5) },
    ]);
  });

  it('keeps ids in rules that refer to nothing in the copied fields', () => {
    const orphan = field({
      id: 'q',
      input_type: 'select',
      logic: {
        rules: [{ if: 'unknown-option', goto_page_id: 'unknown-page' }],
      },
    });

    const [result] = replaceIdsWithNewUuids([orphan]);

    expect(result.logic.rules).toEqual([
      { if: 'unknown-option', goto_page_id: 'unknown-page' },
    ]);
  });

  it('keeps temporary ids and rules that point to them unchanged', () => {
    const tempPage = field({
      id: 'page-x',
      temp_id: 'TEMP-page-x',
      input_type: 'page',
    });
    const question = field({
      id: 'q',
      input_type: 'select',
      logic: { rules: [{ if: 'TEMP-option', goto_page_id: 'TEMP-page-x' }] },
    });

    const result = replaceIdsWithNewUuids([question, tempPage]);

    expect(result[1].temp_id).toBe('TEMP-page-x');
    expect(result[0].logic.rules).toEqual([
      { if: 'TEMP-option', goto_page_id: 'TEMP-page-x' },
    ]);
  });

  it('does not change the fields it is given', () => {
    replaceIdsWithNewUuids(fields);

    expect(select.logic.rules?.[0]).toEqual({
      if: 'option-a',
      goto_page_id: 'page-2',
    });
    expect(pageOne.logic).toEqual({ next_page_id: 'page-3' });
  });
});

describe('replaceUuidsInText', () => {
  it('replaces each uuid consistently, ignoring case', () => {
    const pageId = '6b4cde0a-0715-40dc-904d-74cb7f65d7ba';
    const text = `"goto_page_id": "${pageId}", "next_page_id": "${pageId.toUpperCase()}", "if": 3`;

    const result = replaceUuidsInText(text);
    const uuids = result.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    );

    expect(uuids).toHaveLength(2);
    expect(uuids?.[0]).toBe(uuids?.[1]);
    expect(uuids?.[0]).not.toBe(pageId);
    expect(result).toContain('"if": 3');
  });
});

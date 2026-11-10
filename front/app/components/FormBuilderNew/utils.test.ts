import { IFlatCustomField } from 'api/custom_fields/types';
import { isNewCustomFieldObject } from 'api/custom_fields/util';

import { createNewField } from 'components/FormBuilder/edit/utils';

import {
  asUnsavedField,
  extractUserPage,
  getDeletePageBlocker,
  getDisplayGroups,
  getDuplicatePageBlocker,
  getMergeTargetPage,
  getPageGroups,
  getPageInsertFlatIndex,
  getQuestionInsertFlatIndex,
  insertDuplicatePage,
  insertDuplicateQuestion,
  insertPageAfter,
  insertQuestion,
  movePage,
  moveQuestion,
  removePage,
  removeQuestion,
  USER_PAGE_ID,
} from './utils';

const formatMessage = ((descriptor: { defaultMessage?: string }) =>
  descriptor.defaultMessage ?? '') as Parameters<typeof createNewField>[2];

const field = (
  id: string,
  input_type: IFlatCustomField['input_type'] = 'text',
  extra: Partial<IFlatCustomField> = {}
) =>
  ({
    id,
    key: id,
    input_type,
    title_multiloc: { en: id },
    logic: input_type === 'page' ? {} : { rules: [] },
    enabled: true,
    ...extra,
  } as IFlatCustomField);

// p1: a, b | p2: c | p3: (empty) | end
const fields = [
  field('p1', 'page'),
  field('a'),
  field('b'),
  field('p2', 'page'),
  field('c'),
  field('p3', 'page'),
  field('form_end', 'page', { key: 'form_end' }),
];

const ids = (list: IFlatCustomField[] | null | undefined) =>
  list?.map((f) => f.id);

const newPage = () =>
  asUnsavedField(createNewField('page', 'en', formatMessage));
const newQuestion = () =>
  asUnsavedField(createNewField('text', 'en', formatMessage));

describe('FormBuilderNew utils', () => {
  describe('page groups', () => {
    it('groups fields by page', () => {
      const groups = getPageGroups(fields);
      expect(groups.map((g) => g.page.id)).toEqual([
        'p1',
        'p2',
        'p3',
        'form_end',
      ]);
      expect(groups[0].questions.map((q) => q.field.id)).toEqual(['a', 'b']);
    });

    it('computes insert indexes', () => {
      expect(
        getQuestionInsertFlatIndex(fields, { pageId: 'p1', index: 1 })
      ).toBe(2);
      expect(
        getQuestionInsertFlatIndex(fields, { pageId: 'p3', index: 0 })
      ).toBe(6);
      expect(getPageInsertFlatIndex(fields, 'p1')).toBe(3);
      expect(getPageInsertFlatIndex(fields, 'p3')).toBe(6);
    });
  });

  describe('adding a page', () => {
    // Regression: adding a page used to silently do nothing, because new
    // fields were checked with a guard that also required an `index`.
    it('adds a page made by createNewField after the given page', () => {
      const page = newPage();
      const result = insertPageAfter(fields, 'p1', page);

      expect(ids(result)).toEqual([
        'p1',
        'a',
        'b',
        page.id,
        'p2',
        'c',
        'p3',
        'form_end',
      ]);
    });

    it('adds a page after the last page, before the ending page', () => {
      const page = newPage();
      expect(ids(insertPageAfter(fields, 'p3', page))).toEqual([
        'p1',
        'a',
        'b',
        'p2',
        'c',
        'p3',
        page.id,
        'form_end',
      ]);
    });

    // The cause of that bug, kept as a warning: this guard needs an `index`
    // too, so it rejects freshly created fields. Use asUnsavedField instead.
    it('cannot use isNewCustomFieldObject to admit new fields', () => {
      expect(
        isNewCustomFieldObject(createNewField('page', 'en', formatMessage))
      ).toBe(false);
    });

    it('keeps a new page unsaved: no key, so the backend assigns one', () => {
      const page = newPage();
      expect('key' in page).toBe(false);
      expect(page.input_type).toBe('page');
      expect(page.isLocalOnly).toBe(true);
    });

    it('adds a page after a page was deleted', () => {
      const afterDelete = removePage(fields, 'p2');
      expect(afterDelete).not.toBeNull();
      if (!afterDelete) return;

      const page = newPage();
      expect(ids(insertPageAfter(afterDelete, 'p1', page))).toEqual([
        'p1',
        'a',
        'b',
        'c',
        page.id,
        'p3',
        'form_end',
      ]);
    });

    it('can add several pages in a row', () => {
      const first = newPage();
      const second = newPage();
      const once = insertPageAfter(fields, 'p3', first);
      const twice = once && insertPageAfter(once, first.id, second);
      expect(ids(twice)?.slice(-3)).toEqual([first.id, second.id, 'form_end']);
    });

    it('refuses to add a page after the ending page or an unknown page', () => {
      expect(insertPageAfter(fields, 'form_end', newPage())).toBeNull();
      expect(insertPageAfter(fields, 'nope', newPage())).toBeNull();
      expect(insertPageAfter(fields, 'a', newPage())).toBeNull();
    });
  });

  describe('adding a question', () => {
    it('adds a question made by createNewField at the given spot', () => {
      const question = newQuestion();
      expect(
        ids(insertQuestion(fields, { pageId: 'p1', index: 1 }, question))
      ).toEqual(['p1', 'a', question.id, 'b', 'p2', 'c', 'p3', 'form_end']);
    });

    it('adds a question to an empty page', () => {
      const question = newQuestion();
      expect(
        ids(insertQuestion(fields, { pageId: 'p3', index: 0 }, question))
      ).toEqual(['p1', 'a', 'b', 'p2', 'c', 'p3', question.id, 'form_end']);
    });

    it('refuses to add a question to the ending page', () => {
      expect(
        insertQuestion(fields, { pageId: 'form_end', index: 0 }, newQuestion())
      ).toBeNull();
    });
  });

  describe('moving', () => {
    it('moves a question down within its page', () => {
      expect(
        ids(moveQuestion(fields, 'a', { pageId: 'p1', index: 2 }))
      ).toEqual(['p1', 'b', 'a', 'p2', 'c', 'p3', 'form_end']);
    });

    it('ignores a move onto its own spot', () => {
      expect(moveQuestion(fields, 'a', { pageId: 'p1', index: 1 })).toBeNull();
    });

    it('moves a question to another (empty) page', () => {
      expect(
        ids(moveQuestion(fields, 'a', { pageId: 'p3', index: 0 }))
      ).toEqual(['p1', 'b', 'p2', 'c', 'p3', 'a', 'form_end']);
    });

    it('never moves a question onto the ending page', () => {
      expect(
        moveQuestion(fields, 'a', { pageId: 'form_end', index: 0 })
      ).toBeNull();
    });

    it('moves a page with its questions, keeping the ending page last', () => {
      expect(ids(movePage(fields, 'p1', 5))).toEqual([
        'p2',
        'c',
        'p3',
        'p1',
        'a',
        'b',
        'form_end',
      ]);
    });
  });

  describe('duplicating', () => {
    it('duplicates a question right after it', () => {
      const result = insertDuplicateQuestion(fields, 'a', 'copy');
      expect(result).not.toBeNull();
      if (!result) return;

      expect(ids(result.fields)?.slice(0, 4)).toEqual([
        'p1',
        'a',
        result.newId,
        'b',
      ]);
      const copy = result.fields[2];
      expect(copy.title_multiloc).toEqual({ en: 'a (copy)' });
      expect('key' in copy).toBe(false);
      expect(copy.isLocalOnly).toBe(true);
    });

    it('does not duplicate map questions', () => {
      const withMap = [field('p1', 'page'), field('m', 'point')];
      expect(insertDuplicateQuestion(withMap, 'm', 'copy')).toBeNull();
    });

    it('duplicates a page with its questions right after it', () => {
      const result = insertDuplicatePage(fields, 'p1', 'copy');
      expect(result).not.toBeNull();
      if (!result) return;

      const list = result.fields;
      expect(list).toHaveLength(fields.length + 3);
      expect(list[3].id).toBe(result.newPageId);
      expect(list[3].title_multiloc).toEqual({ en: 'p1 (copy)' });
      // Questions keep their titles, get new ids and no logic.
      expect(list.slice(4, 6).map((f) => f.title_multiloc.en)).toEqual([
        'a',
        'b',
      ]);
      expect(new Set(ids(list)).size).toBe(list.length);
      expect(list[4].logic).toEqual({ rules: [] });
      expect(ids(list.slice(6))).toEqual(['p2', 'c', 'p3', 'form_end']);
    });

    it('explains why a page cannot be duplicated', () => {
      const withMap = [
        field('p1', 'page'),
        field('m', 'point'),
        field('form_end', 'page', { key: 'form_end' }),
      ];
      expect(getDuplicatePageBlocker(withMap, withMap[0])).toBe('mapQuestions');
      expect(getDuplicatePageBlocker(fields, fields[6])).toBe('formEnd');
      expect(insertDuplicatePage(withMap, 'p1', 'copy')).toBeNull();
    });
  });

  describe('deleting', () => {
    it('removes a question', () => {
      expect(ids(removeQuestion(fields, 'a'))).toEqual([
        'p1',
        'b',
        'p2',
        'c',
        'p3',
        'form_end',
      ]);
      expect(removeQuestion(fields, 'p1')).toBeNull();
    });

    it('removes the first page, handing its questions to the next page', () => {
      expect(ids(removePage(fields, 'p1'))).toEqual([
        'p2',
        'a',
        'b',
        'c',
        'p3',
        'form_end',
      ]);
    });

    it('moves the questions of a deleted page to the previous page', () => {
      expect(getMergeTargetPage(fields, 'p2')?.id).toBe('p1');
      expect(ids(removePage(fields, 'p2', 'keepQuestions'))).toEqual([
        'p1',
        'a',
        'b',
        'c',
        'p3',
        'form_end',
      ]);
    });

    it('moves the questions of the first page to the next page', () => {
      expect(getMergeTargetPage(fields, 'p1')?.id).toBe('p2');
    });

    it('can delete a page together with its questions', () => {
      expect(ids(removePage(fields, 'p2', 'deleteQuestions'))).toEqual([
        'p1',
        'a',
        'b',
        'p3',
        'form_end',
      ]);
      expect(ids(removePage(fields, 'p1', 'deleteQuestions'))).toEqual([
        'p2',
        'c',
        'p3',
        'form_end',
      ]);
    });

    it('still adds pages after deleting a page with its questions', () => {
      const afterDelete = removePage(fields, 'p2', 'deleteQuestions');
      const page = newPage();
      expect(
        ids(afterDelete && insertPageAfter(afterDelete, 'p1', page))
      ).toEqual(['p1', 'a', 'b', page.id, 'p3', 'form_end']);
    });

    it('removes a page and drops logic pointing at it', () => {
      const withLogic = [
        field('p1', 'page', { logic: { next_page_id: 'p2' } }),
        field('a', 'text', {
          logic: { rules: [{ if: 'x', goto_page_id: 'p2' }] },
        }),
        field('p2', 'page'),
        field('c'),
      ];
      const result = removePage(withLogic, 'p2');
      expect(ids(result)).toEqual(['p1', 'a', 'c']);
      expect(result?.[0].logic).toEqual({});
      expect(result?.[1].logic).toEqual({ rules: [] });
    });

    it('explains why a page cannot be deleted, and refuses to', () => {
      const single = [
        field('p1', 'page'),
        field('a'),
        field('form_end', 'page', { key: 'form_end' }),
      ];
      expect(getDeletePageBlocker(single, single[0])).toBe('onlyPage');
      expect(removePage(single, 'p1')).toBeNull();

      expect(getDeletePageBlocker(fields, fields[6])).toBe('formEnd');
      expect(removePage(fields, 'form_end')).toBeNull();

      const locked = field('p2', 'page', {
        constraints: { locks: { deletion: true } },
      } as Partial<IFlatCustomField>);
      expect(getDeletePageBlocker([fields[0], locked], locked)).toBe('locked');

      expect(getDeletePageBlocker(fields, fields[0])).toBeNull();
    });
  });

  describe('demographics page', () => {
    const publicFields = [
      field('p1', 'page'),
      field('a'),
      field('random-uuid', 'page', { key: 'user_page' }),
      field('u_gender', 'select'),
      field('form_end', 'page', { key: 'form_end' }),
    ];

    it('takes it from the public fields with a stable id', () => {
      const userPage = extractUserPage(publicFields);
      expect(userPage?.page.id).toBe(USER_PAGE_ID);
      expect(userPage?.questions.map((q) => q.field.id)).toEqual(['u_gender']);
    });

    it('is absent without demographic questions', () => {
      expect(extractUserPage(fields)).toBeNull();
      expect(extractUserPage(undefined)).toBeNull();
    });

    it('is shown right before the ending page', () => {
      const userPage = extractUserPage(publicFields);
      expect(
        getDisplayGroups(getPageGroups(fields), userPage).map((g) => g.page.id)
      ).toEqual(['p1', 'p2', 'p3', USER_PAGE_ID, 'form_end']);
    });

    it('cannot be deleted or duplicated', () => {
      const userPage = extractUserPage(publicFields);
      if (!userPage) throw new Error('expected a demographics page');
      expect(getDeletePageBlocker(fields, userPage.page)).toBe('demographics');
      expect(getDuplicatePageBlocker(fields, userPage.page)).toBe(
        'demographics'
      );
    });
  });
});

import { Multiloc } from 'typings';

import {
  ICreateMatrixStatementsType,
  ICustomFieldInputType,
  IFlatCustomField,
  IOptionsType,
} from 'api/custom_fields/types';

import { generateTempId } from 'utils/helperUtils';

// The form is stored as one flat list: each page field is followed by its
// questions, up to the next page field. These helpers translate between that
// list and the page-by-page view the new builder works with.

export type PageQuestion = {
  field: IFlatCustomField;
  flatIndex: number;
};

export type PageGroup = {
  page: IFlatCustomField;
  flatIndex: number;
  questions: PageQuestion[];
};

// Where a question goes: the page, and the slot among that page's questions
// (0 = above the first question, questions.length = below the last one).
export type QuestionPosition = {
  pageId: string;
  index: number;
};

// Fields created in the builder (new or duplicated) have no `key` or `type`
// until they're saved: the backend assigns them, and saving must not send a
// made-up key. The rest of the form code types fields as saved ones, so new
// fields enter the list through here.
// Note: don't use isNewCustomFieldObject for this. It also requires an
// `index` property, and a failing check made adding pages silently do nothing.
type UnsavedFieldCore = Pick<
  IFlatCustomField,
  'id' | 'input_type' | 'title_multiloc' | 'logic'
> & { key?: undefined };

export const asUnsavedField = <T extends UnsavedFieldCore>(
  field: T
): IFlatCustomField =>
  // Deliberate, and the only such conversion: the field types don't model
  // unsaved fields (no key, new options/statements without ids). The same
  // objects the current builder creates; `key`/`type` are set on save.
  field as unknown as IFlatCustomField;

export const isFormEndPage = (field: IFlatCustomField) =>
  field.input_type === 'page' && field.key === 'form_end';

export const getPageGroups = (fields: IFlatCustomField[]): PageGroup[] => {
  const groups: PageGroup[] = [];
  fields.forEach((field, flatIndex) => {
    if (field.input_type === 'page') {
      groups.push({ page: field, flatIndex, questions: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].questions.push({ field, flatIndex });
    }
  });
  return groups;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getQuestionInsertFlatIndex = (
  fields: IFlatCustomField[],
  position: QuestionPosition
): number | null => {
  const group = getPageGroups(fields).find(
    (group) => group.page.id === position.pageId
  );
  if (!group) return null;
  return group.flatIndex + 1 + clamp(position.index, 0, group.questions.length);
};

// A new page is inserted right after the given page's last question, so it
// never splits an existing page.
export const getPageInsertFlatIndex = (
  fields: IFlatCustomField[],
  afterPageId: string
): number | null => {
  const groups = getPageGroups(fields);
  const groupIndex = groups.findIndex((group) => group.page.id === afterPageId);
  if (groupIndex === -1) return null;
  const nextGroup = groups[groupIndex + 1] as PageGroup | undefined;
  return nextGroup ? nextGroup.flatIndex : fields.length;
};

export const moveQuestion = (
  fields: IFlatCustomField[],
  questionId: string,
  target: QuestionPosition
): IFlatCustomField[] | null => {
  const groups = getPageGroups(fields);
  const sourceGroup = groups.find((group) =>
    group.questions.some((question) => question.field.id === questionId)
  );
  const targetGroup = groups.find((group) => group.page.id === target.pageId);
  if (!sourceGroup || !targetGroup || isFormEndPage(targetGroup.page)) {
    return null;
  }

  const sourcePosition = sourceGroup.questions.findIndex(
    (question) => question.field.id === questionId
  );
  const { field: question, flatIndex: sourceFlatIndex } =
    sourceGroup.questions[sourcePosition];

  let targetIndex = target.index;
  if (sourceGroup.page.id === target.pageId) {
    // Slots below the question shift up by one once it's taken out.
    if (sourcePosition < targetIndex) targetIndex -= 1;
    if (sourcePosition === targetIndex) return null;
  }

  const withoutQuestion = fields.filter((_, i) => i !== sourceFlatIndex);
  const insertAt = getQuestionInsertFlatIndex(withoutQuestion, {
    pageId: target.pageId,
    index: targetIndex,
  });
  if (insertAt === null) return null;

  return [
    ...withoutQuestion.slice(0, insertAt),
    question,
    ...withoutQuestion.slice(insertAt),
  ];
};

const getPageBlocks = (fields: IFlatCustomField[]) => {
  const groups = getPageGroups(fields);
  return groups.map((group, i) => {
    const end = i + 1 < groups.length ? groups[i + 1].flatIndex : fields.length;
    return fields.slice(group.flatIndex, end);
  });
};

// Moves a page together with its questions to the given page position.
// The ending page always stays last.
export const movePage = (
  fields: IFlatCustomField[],
  pageId: string,
  targetPageIndex: number
): IFlatCustomField[] | null => {
  const blocks = getPageBlocks(fields);
  const sourceIndex = blocks.findIndex((block) => block[0].id === pageId);
  if (sourceIndex === -1 || isFormEndPage(blocks[sourceIndex][0])) return null;

  const hasFormEnd = isFormEndPage(blocks[blocks.length - 1][0]);
  const maxIndex = hasFormEnd ? blocks.length - 2 : blocks.length - 1;
  const targetIndex = clamp(targetPageIndex, 0, maxIndex);
  if (targetIndex === sourceIndex) return null;

  const reordered = [...blocks];
  const [moved] = reordered.splice(sourceIndex, 1);
  reordered.splice(targetIndex, 0, moved);
  return reordered.flat();
};

const isLinkedTo = (pageId: string | undefined, page: IFlatCustomField) =>
  !!pageId && (pageId === page.id || pageId === page.temp_id);

// What happens to the questions of a deleted page.
export type DeletePageMode = 'keepQuestions' | 'deleteQuestions';

// The page that receives the questions of a deleted page: the previous page,
// or the next one when it's the first page.
export const getMergeTargetPage = (
  fields: IFlatCustomField[],
  pageId: string
): IFlatCustomField | null => {
  const groups = getPageGroups(fields);
  const index = groups.findIndex((group) => group.page.id === pageId);
  if (index === -1) return null;
  const target = index === 0 ? groups[1] : groups[index - 1];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- out of range when it's the only page
  return target?.page ?? null;
};

// Removes a page, and either moves its questions to the merge target page
// (see above) or deletes them too. Logic that pointed at the page is dropped.
export const removePage = (
  fields: IFlatCustomField[],
  pageId: string,
  mode: DeletePageMode = 'keepQuestions'
): IFlatCustomField[] | null => {
  const blocks = getPageBlocks(fields);
  const index = blocks.findIndex((block) => block[0].id === pageId);
  if (index === -1) return null;
  const [page, ...questions] = blocks[index];
  if (getDeletePageBlocker(fields, page)) return null;

  let result: IFlatCustomField[];
  if (mode === 'deleteQuestions') {
    result = [
      ...blocks.slice(0, index).flat(),
      ...blocks.slice(index + 1).flat(),
    ];
  } else if (index === 0) {
    if (blocks.length < 2) return null;
    const [nextPage, ...nextQuestions] = blocks[1];
    result = [
      nextPage,
      ...questions,
      ...nextQuestions,
      ...blocks.slice(2).flat(),
    ];
  } else {
    result = [
      ...blocks.slice(0, index).flat(),
      ...questions,
      ...blocks.slice(index + 1).flat(),
    ];
  }

  return result.map((field) => {
    // `logic` is typed as always present, but older fields can lack it.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const logic = field.logic ?? {};
    const rules = logic.rules;
    const pointsAtPage =
      isLinkedTo(logic.next_page_id, page) ||
      (rules ?? []).some((rule) => isLinkedTo(rule.goto_page_id, page));
    if (!pointsAtPage) return field;

    return {
      ...field,
      logic: rules
        ? {
            rules: rules.filter((rule) => !isLinkedTo(rule.goto_page_id, page)),
          }
        : {},
    };
  });
};

const MAPPING_INPUT_TYPES: ICustomFieldInputType[] = [
  'point',
  'line',
  'polygon',
  'multipoint',
];

// Mapping questions own a map config that would need duplicating server-side,
// so they're left out of the quick duplicate action for now.
export const canDuplicate = (field: IFlatCustomField) =>
  field.input_type !== 'page' &&
  !field.code &&
  !MAPPING_INPUT_TYPES.includes(field.input_type);

// Copies a question or page as a new, unsaved field. Logic isn't copied.
// Without a suffix the title is kept as is.
export const duplicateField = (
  original: IFlatCustomField,
  copySuffix?: string
) => {
  const {
    id: _id,
    temp_id: _tempId,
    logic: _logic,
    isLocalOnly: _isLocalOnly,
    key: _key,
    code: _code,
    title_multiloc,
    options,
    matrix_statements,
    ...rest
  } = original;

  const title: Multiloc = {};
  Object.entries(title_multiloc).forEach(([locale, value]) => {
    title[locale] = value && copySuffix ? `${value} (${copySuffix})` : value;
  });

  const duplicatedOptions: IOptionsType[] | undefined = options?.map(
    ({ id: _optionId, temp_id: _optionTempId, ...option }) => ({
      ...option,
      temp_id: generateTempId(),
    })
  );
  const duplicatedStatements: ICreateMatrixStatementsType[] | undefined =
    matrix_statements?.map(({ id: _statementId, ...statement }) => ({
      ...statement,
      temp_id: generateTempId(),
    }));

  return asUnsavedField({
    ...rest,
    // Local ids aren't sent to the server, so any unique string works.
    id: generateTempId(),
    temp_id: generateTempId(),
    logic: original.input_type === 'page' ? {} : { rules: [] },
    isLocalOnly: true,
    title_multiloc: title,
    ...(duplicatedOptions?.length ? { options: duplicatedOptions } : {}),
    ...(duplicatedStatements?.length
      ? { matrix_statements: duplicatedStatements }
      : {}),
  });
};

// The demographics page isn't part of the editable form. When demographic
// questions are asked in the form (access rights setting), the backend adds
// it, with those questions, right before the ending page of the public
// (participant-facing) fields. Its id is random on every request, so it gets
// a fixed one here.
export const USER_PAGE_ID = 'user_page';

export const isUserPage = (field: IFlatCustomField) =>
  field.input_type === 'page' && field.key === USER_PAGE_ID;

export const extractUserPage = (
  publicFields: IFlatCustomField[] | undefined
): PageGroup | null => {
  const group = getPageGroups(publicFields ?? []).find((group) =>
    isUserPage(group.page)
  );
  if (!group || group.questions.length === 0) return null;
  return {
    ...group,
    page: { ...group.page, id: USER_PAGE_ID },
  };
};

// The pages as participants go through them: the editable pages, with the
// demographics page (if any) right before the ending page.
export const getDisplayGroups = (
  groups: PageGroup[],
  userPage: PageGroup | null
): PageGroup[] => {
  if (!userPage) return groups;
  const last = groups.length > 0 ? groups[groups.length - 1] : undefined;
  return last && isFormEndPage(last.page)
    ? [...groups.slice(0, -1), userPage, last]
    : [...groups, userPage];
};

const insertAt = (
  fields: IFlatCustomField[],
  index: number,
  newFields: IFlatCustomField[]
) => [...fields.slice(0, index), ...newFields, ...fields.slice(index)];

// --- Structural changes ---
// Each returns the new field list, or null when the change isn't possible.

export const insertPageAfter = (
  fields: IFlatCustomField[],
  afterPageId: string,
  page: IFlatCustomField
): IFlatCustomField[] | null => {
  const after = fields.find((field) => field.id === afterPageId);
  if (!after || after.input_type !== 'page' || isFormEndPage(after)) {
    return null;
  }
  const index = getPageInsertFlatIndex(fields, afterPageId);
  return index === null ? null : insertAt(fields, index, [page]);
};

export const insertQuestion = (
  fields: IFlatCustomField[],
  position: QuestionPosition,
  question: IFlatCustomField
): IFlatCustomField[] | null => {
  const page = fields.find((field) => field.id === position.pageId);
  if (!page || isFormEndPage(page)) return null;
  const index = getQuestionInsertFlatIndex(fields, position);
  return index === null ? null : insertAt(fields, index, [question]);
};

export const insertDuplicateQuestion = (
  fields: IFlatCustomField[],
  questionId: string,
  copySuffix: string
): { fields: IFlatCustomField[]; newId: string } | null => {
  const index = fields.findIndex((field) => field.id === questionId);
  if (index === -1 || !canDuplicate(fields[index])) return null;
  const copy = duplicateField(fields[index], copySuffix);
  return { fields: insertAt(fields, index + 1, [copy]), newId: copy.id };
};

export const removeQuestion = (
  fields: IFlatCustomField[],
  questionId: string
): IFlatCustomField[] | null => {
  const field = fields.find((field) => field.id === questionId);
  if (!field || field.input_type === 'page') return null;
  return fields.filter((field) => field.id !== questionId);
};

// Why a page action isn't available, shown on the disabled menu item.
export type PageActionBlocker =
  | 'formEnd'
  | 'demographics'
  | 'onlyPage'
  | 'locked'
  | 'mapQuestions';

export const getDeletePageBlocker = (
  fields: IFlatCustomField[],
  page: IFlatCustomField
): PageActionBlocker | null => {
  if (isUserPage(page)) return 'demographics';
  if (isFormEndPage(page)) return 'formEnd';
  // `locks` is typed as always present, but the API can leave it out.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (page.constraints?.locks?.deletion) return 'locked';
  const regularPages = fields.filter(
    (field) => field.input_type === 'page' && !isFormEndPage(field)
  );
  if (regularPages.length < 2) return 'onlyPage';
  return null;
};

export const getDuplicatePageBlocker = (
  fields: IFlatCustomField[],
  page: IFlatCustomField
): PageActionBlocker | null => {
  if (isUserPage(page)) return 'demographics';
  if (isFormEndPage(page)) return 'formEnd';
  const group = getPageGroups(fields).find((g) => g.page.id === page.id);
  if (group?.questions.some(({ field }) => !canDuplicate(field))) {
    return 'mapQuestions';
  }
  return null;
};

// Copies a page with its questions right after it. The page title gets the
// suffix; the questions keep their titles.
export const insertDuplicatePage = (
  fields: IFlatCustomField[],
  pageId: string,
  copySuffix: string
): { fields: IFlatCustomField[]; newPageId: string } | null => {
  const page = fields.find((field) => field.id === pageId);
  if (!page || getDuplicatePageBlocker(fields, page)) return null;
  const block = getPageBlocks(fields).find((block) => block[0].id === pageId);
  const index = getPageInsertFlatIndex(fields, pageId);
  if (!block || index === null) return null;

  const [, ...questions] = block;
  const pageCopy = duplicateField(page, copySuffix);
  return {
    fields: insertAt(fields, index, [
      pageCopy,
      ...questions.map((question) => duplicateField(question)),
    ]),
    newPageId: pageCopy.id,
  };
};

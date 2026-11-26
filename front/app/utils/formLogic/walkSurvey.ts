import { Answers, Condition, Program, ProgramPage, Walk } from './types';

const END = 'end';

type Scalar = string | number | boolean;

const isPresent = (value: unknown) =>
  !(
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0)
  );

// Ids come from the backend, but never read inherited properties such as `constructor`.
const own = <T>(record: Record<string, T>, key: string): T | undefined =>
  Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;

const isNumber = (value: unknown): value is number => typeof value === 'number';

const isScalar = (value: unknown): value is Scalar =>
  typeof value === 'string' || isNumber(value) || typeof value === 'boolean';

const isScalarList = (value: unknown): value is Scalar[] =>
  Array.isArray(value) && value.every(isScalar);

const isPresentScalar = (value: unknown): value is Scalar =>
  isScalar(value) && isPresent(value);

const compare = (op: string, value: number, expected: number) => {
  switch (op) {
    case 'gt':
      return value > expected;
    case 'gte':
      return value >= expected;
    case 'lt':
      return value < expected;
    default:
      return value <= expected;
  }
};

const leafMatches = (op: string, value: unknown, expected: unknown) => {
  switch (op) {
    case 'present':
      return isPresent(value);
    case 'absent':
      return !isPresent(value);
    case 'eq':
      return isScalar(expected) && isScalar(value) && value === expected;
    case 'one_of':
      return (
        isScalarList(expected) &&
        isPresentScalar(value) &&
        expected.includes(value)
      );
    case 'none_of':
      return (
        isScalarList(expected) &&
        isPresentScalar(value) &&
        !expected.includes(value)
      );
    case 'contains_any':
      return (
        isScalarList(expected) &&
        Array.isArray(value) &&
        value.some((v) => isScalar(v) && expected.includes(v))
      );
    case 'contains_all':
      return (
        isScalarList(expected) &&
        Array.isArray(value) &&
        expected.every((e) => value.includes(e))
      );
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return (
        isNumber(value) && isNumber(expected) && compare(op, value, expected)
      );
    default:
      throw new Error(`Unknown operator ${op}`);
  }
};

export const matches = (condition: Condition, answers: Answers): boolean => {
  if ('all' in condition) {
    return condition.all.every((c) => matches(c, answers));
  }
  if ('any' in condition) {
    return condition.any.some((c) => matches(c, answers));
  }
  if ('not' in condition) return !matches(condition.not, answers);
  return leafMatches(
    condition.op,
    own(answers, condition.field),
    condition.value
  );
};

const nextIndex = (
  pageCount: number,
  pageIndex: Map<string, number>,
  page: ProgramPage,
  index: number,
  seenAnswers: Answers
): number | null => {
  const jump = (page.jumps ?? []).find((j) => matches(j.when, seenAnswers));
  const target = jump ? jump.goto : page.next;
  if (target === END) return null;

  const targetIndex =
    target === undefined || target === null ? index + 1 : pageIndex.get(target);
  if (
    targetIndex === undefined ||
    targetIndex <= index ||
    targetIndex >= pageCount
  ) {
    return null;
  }
  return targetIndex;
};

export const walkSurvey = (program: Program, answers: Answers): Walk => {
  const fields = program.fields ?? {};
  const pageIndex = new Map(program.pages.map((p, i) => [p.id, i]));
  const walk: Walk = {
    path: [],
    visibleIds: [],
    requiredIds: [],
    answers: {},
  };

  let index: number | null = program.pages.length > 0 ? 0 : null;
  while (index !== null) {
    const page = program.pages[index];
    walk.path.push(page.id);

    (page.fields ?? []).forEach((id) => {
      const field = own(fields, id) ?? {};
      if (field.display && !matches(field.display, walk.answers)) return;

      walk.visibleIds.push(id);
      if (Object.prototype.hasOwnProperty.call(answers, id)) {
        walk.answers[id] = own(answers, id);
      }
      if (
        field.required === true ||
        (field.required_if && matches(field.required_if, walk.answers))
      ) {
        walk.requiredIds.push(id);
      }
    });

    index = nextIndex(
      program.pages.length,
      pageIndex,
      page,
      index,
      walk.answers
    );
  }

  return walk;
};

import {
  Answers,
  Condition,
  EvaluationResult,
  Program,
  ProgramPage,
} from './types';

const END = 'end';

const isPresent = (value: unknown) =>
  !(
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );

const isNumber = (value: unknown): value is number => typeof value === 'number';

const leafMatches = (op: string, value: unknown, expected: any): boolean => {
  const list = expected as unknown[];

  switch (op) {
    case 'present':
      return isPresent(value);
    case 'absent':
      return !isPresent(value);
    case 'eq':
      return isPresent(value) && value === expected;
    case 'one_of':
      return isPresent(value) && list.includes(value);
    case 'none_of':
      return isPresent(value) && !list.includes(value);
    case 'contains_any':
      return Array.isArray(value) && value.some((v) => list.includes(v));
    case 'contains_all':
      return Array.isArray(value) && list.every((v) => value.includes(v));
    case 'gt':
      return isNumber(value) && value > expected;
    case 'gte':
      return isNumber(value) && value >= expected;
    case 'lt':
      return isNumber(value) && value < expected;
    case 'lte':
      return isNumber(value) && value <= expected;
    default:
      throw new Error(`Unknown operator ${op}`);
  }
};

export const matches = (condition: Condition, answers: Answers): boolean => {
  if ('all' in condition) {
    return condition.all.every((c) => matches(c, answers));
  }
  if ('any' in condition) return condition.any.some((c) => matches(c, answers));
  if ('not' in condition) return !matches(condition.not, answers);
  return leafMatches(condition.op, answers[condition.key], condition.value);
};

const nextIndex = (
  program: Program,
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
    targetIndex >= program.pages.length
  ) {
    return null;
  }
  return targetIndex;
};

export const evaluate = (
  program: Program,
  answers: Answers
): EvaluationResult => {
  const fields = program.fields ?? {};
  const pageIndex = new Map(program.pages.map((p, i) => [p.key, i]));
  const result: EvaluationResult = {
    path: [],
    visibleKeys: [],
    requiredKeys: [],
    answers: {},
  };

  let index: number | null = program.pages.length > 0 ? 0 : null;
  while (index !== null) {
    const page = program.pages[index];
    result.path.push(page.key);

    page.fields.forEach((key) => {
      const field = fields[key] ?? {};
      if (field.display && !matches(field.display, result.answers)) return;

      result.visibleKeys.push(key);
      if (key in answers) result.answers[key] = answers[key];
      if (
        field.required ||
        (field.required_if && matches(field.required_if, result.answers))
      ) {
        result.requiredKeys.push(key);
      }
    });

    index = nextIndex(program, pageIndex, page, index, result.answers);
  }

  return result;
};

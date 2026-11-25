// The compiled runtime program the backend serializes with the form's custom fields.
// Built by FormLogic::Compiler (back/lib/form_logic/compiler.rb); see evaluator.rb for the
// semantics. Everything is in answer space: field keys and option keys.

export type Operator =
  | 'present'
  | 'absent'
  | 'eq'
  | 'one_of'
  | 'none_of'
  | 'contains_any'
  | 'contains_all'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { key: string; op: Operator; value?: unknown };

export type PageTarget = string; // a page key or 'end'

export interface ProgramPage {
  key: string;
  fields: string[];
  jumps?: { when: Condition; goto: PageTarget }[];
  next?: PageTarget | null;
}

export interface ProgramField {
  required?: boolean;
  display?: Condition;
  required_if?: Condition;
}

export interface Program {
  pages: ProgramPage[];
  fields?: Record<string, ProgramField>;
}

export type Answers = Record<string, unknown>;

export interface EvaluationResult {
  path: string[];
  visibleKeys: string[];
  requiredKeys: string[];
  answers: Answers;
}

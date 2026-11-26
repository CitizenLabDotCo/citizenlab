// The compiled program the backend serializes with the form's custom fields.
// Built by FormLogic::Compiler (back/lib/form_logic/compiler.rb); see survey_walker.rb for
// the semantics. Pages and questions are referenced by custom field id.

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

export type Leaf = { field: string; op: Operator; value?: unknown };

export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | Leaf;

// A page id, or 'end'.
export type PageTarget = string;

export interface ProgramPage {
  id: string;
  fields?: string[];
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
  fields?: Record<string, ProgramField> | null;
}

// Answers keyed by question id.
export type Answers = Record<string, unknown>;

export interface Walk {
  path: string[];
  visibleIds: string[];
  requiredIds: string[];
  answers: Answers;
}

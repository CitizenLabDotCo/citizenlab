// Runs the fixture that back/spec/lib/form_logic/evaluator_spec.rb also runs, so the TS
// interpreter and the Ruby evaluator cannot drift apart.
import fs from 'fs';
import path from 'path';

import { evaluate } from './interpret';
import { Answers, Program } from './types';

const FIXTURE_PATH = path.resolve(
  __dirname,
  '../../../../back/spec/fixtures/form_logic/programs.json'
);

interface FixtureCase {
  description: string;
  program: Program;
  answers: Answers;
  expected: {
    path: string[];
    visible_keys: string[];
    required_keys: string[];
    answers: Answers;
  };
}

const fixture: { cases: FixtureCase[] } = JSON.parse(
  fs.readFileSync(FIXTURE_PATH, 'utf8')
);

describe('form logic interpreter', () => {
  // `it.each` over an empty corpus generates no tests, so a truncated fixture would pass.
  it('still has a full corpus', () => {
    expect(fixture.cases.length).toBeGreaterThanOrEqual(15);
  });

  it.each(fixture.cases.map((c) => [c.description, c]))(
    '%s',
    (_description, { program, answers, expected }: FixtureCase) => {
      const result = evaluate(program, answers);

      expect({
        path: result.path,
        visible_keys: result.visibleKeys,
        required_keys: result.requiredKeys,
        answers: result.answers,
      }).toEqual(expected);
    }
  );
});

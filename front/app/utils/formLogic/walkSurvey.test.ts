// Runs the fixtures that back/spec/lib/form_logic/survey_walker_spec.rb also runs, so the TS
// walker and the Ruby walker cannot drift apart.
import fs from 'fs';
import path from 'path';

import { Answers, Program } from './types';
import { walkSurvey } from './walkSurvey';

const FIXTURE_DIR = path.resolve(
  __dirname,
  '../../../../back/spec/fixtures/form_logic/walker'
);

interface FixtureCase {
  description: string;
  program: Program | string;
  answers: Answers;
  raises?: string;
  expected?: {
    path: string[];
    visible_ids: string[];
    required_ids: string[];
    answers: Answers;
  };
}

interface FixtureFile {
  description: string;
  programs?: Record<string, Program>;
  cases: FixtureCase[];
}

const files = fs
  .readdirSync(FIXTURE_DIR)
  .filter((name) => name.endsWith('.json'))
  .sort();

// The fixtures are written by hand to this shape; reading them is the trusted boundary.
const readFixture = (name: string): FixtureFile =>
  JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));

const resolveProgram = (fixture: FixtureFile, program: Program | string) => {
  if (typeof program !== 'string') return program;
  const named = fixture.programs?.[program];
  if (!named) throw new Error(`Unknown program ${program}`);
  return named;
};

describe('walkSurvey', () => {
  // `it.each` over an empty corpus generates no tests, so a truncated fixture would pass.
  it('still has a full corpus', () => {
    expect(files.length).toBeGreaterThanOrEqual(12);
    const caseCount = files.reduce(
      (sum, name) => sum + readFixture(name).cases.length,
      0
    );
    expect(caseCount).toBeGreaterThanOrEqual(200);
  });

  describe.each(files)('%s', (name) => {
    const fixture = readFixture(name);

    it.each(fixture.cases.map((c) => [c.description, c] as const))(
      '%s',
      (_description, testCase) => {
        const program = resolveProgram(fixture, testCase.program);

        if (testCase.raises) {
          expect(() => walkSurvey(program, testCase.answers)).toThrow();
          return;
        }

        const walk = walkSurvey(program, testCase.answers);
        expect({
          path: walk.path,
          visible_ids: walk.visibleIds,
          required_ids: walk.requiredIds,
          answers: walk.answers,
        }).toEqual(testCase.expected);
      }
    );
  });
});

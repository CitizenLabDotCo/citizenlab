// Pins today's respondent paths on the shared legacy fixtures. The same fixtures run against
// the new engine in back/spec/lib/form_logic/legacy_spec.rb, so swapping this runtime for the
// engine cannot change a path unnoticed. Cases where the engine deliberately differs record
// both outcomes under `divergent`.
import fs from 'fs';
import path from 'path';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Pages } from '../util';

import { getValidPagePath } from './logic';

const FIXTURE_DIR = path.resolve(
  __dirname,
  '../../../../../back/spec/fixtures/form_logic/legacy'
);

type LegacyField = IFlatCustomField & { enabled?: boolean };

interface LegacyCase {
  description: string;
  fields: LegacyField[];
  answers: Record<string, unknown>;
  expected?: { path: string[] };
  divergent?: { runtime: string[]; engine: string[] };
}

const files = fs
  .readdirSync(FIXTURE_DIR)
  .filter((name) => name.endsWith('.json'))
  .sort();

// The fixtures hold just the attributes the logic reads; reading them is the trusted boundary.
const readFixture = (name: string): { cases: LegacyCase[] } =>
  JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));

// The public fields endpoint only returns enabled fields.
const toPages = (fields: LegacyField[]): Pages =>
  fields
    .filter((field) => field.enabled !== false)
    .reduce<Pages>((pages, field) => {
      if (field.input_type === 'page') {
        pages.push({ page: field, pageQuestions: [] });
      } else {
        pages[pages.length - 1].pageQuestions.push(field);
      }
      return pages;
    }, []);

describe('survey logic characterization', () => {
  it('still has a full corpus', () => {
    const caseCount = files.reduce(
      (sum, name) => sum + readFixture(name).cases.length,
      0
    );
    expect(caseCount).toBeGreaterThanOrEqual(70);
  });

  describe.each(files)('%s', (name) => {
    it.each(readFixture(name).cases.map((c) => [c.description, c] as const))(
      '%s',
      (_description, { fields, answers, expected, divergent }) => {
        const pages = toPages(fields);
        const pagePath = getValidPagePath({ pages, formData: answers }).map(
          (index) => pages[index].page.key
        );

        expect(pagePath).toEqual(expected?.path ?? divergent?.runtime);
      }
    );
  });
});

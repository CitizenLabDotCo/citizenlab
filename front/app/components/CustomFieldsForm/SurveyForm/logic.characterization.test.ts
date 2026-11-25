// Pins today's respondent paths on the shared legacy fixture. The same fixture is run against
// the results generator (RSpec) and, once it exists, against LegacyNormalizer + Compiler +
// Evaluator, so swapping this file for formLogic/interpret.ts cannot change a path unnoticed.
import fs from 'fs';
import path from 'path';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Pages } from '../util';

import { getValidPagePath } from './logic';

const FIXTURE_PATH = path.resolve(
  __dirname,
  '../../../../../back/spec/fixtures/form_logic/legacy_paths.json'
);

interface LegacyCase {
  description: string;
  fields: IFlatCustomField[];
  answers: Record<string, unknown>;
  expected?: { path: string[] };
  divergent?: { survey_runtime: string[]; results: string[] };
}

const fixture: { cases: LegacyCase[] } = JSON.parse(
  fs.readFileSync(FIXTURE_PATH, 'utf8')
);

const toPages = (fields: IFlatCustomField[]): Pages =>
  fields.reduce<Pages>((pages, field) => {
    if (field.input_type === 'page') {
      pages.push({ page: field, pageQuestions: [] });
    } else {
      pages[pages.length - 1].pageQuestions.push(field);
    }
    return pages;
  }, []);

describe('survey logic characterization', () => {
  it.each(fixture.cases.map((c) => [c.description, c]))(
    '%s',
    (_description, { fields, answers, expected, divergent }: LegacyCase) => {
      const pages = toPages(fields);
      const path = getValidPagePath({ pages, formData: answers }).map(
        (index) => pages[index].page.key
      );

      expect(path).toEqual(expected?.path ?? divergent?.survey_runtime);
    }
  );
});

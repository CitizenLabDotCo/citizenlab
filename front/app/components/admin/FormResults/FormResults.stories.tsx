import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { waitFor } from 'storybook/test';

import { phaseApiPath } from 'api/survey_results/__mocks__/_mockServer';
import { SurveyResultsType } from 'api/survey_results/types';

import mockEndpoints from 'utils/storybook/mockEndpoints';

import FormResults from '.';

const results: SurveyResultsType = {
  data: {
    type: 'survey_results',
    attributes: {
      totalSubmissions: 80,
      results: [
        {
          inputType: 'select',
          question: { en: 'How do you usually get to work?' },
          required: true,
          grouped: false,
          totalResponseCount: 80,
          questionResponseCount: 80,
          totalPickCount: 80,
          description: {},
          questionNumber: 1,
          pageNumber: 1,
          hidden: false,
          logic: {},
          answers: [
            { answer: 'bike', count: 42 },
            { answer: 'bus', count: 27 },
            { answer: 'car', count: 11 },
          ],
          multilocs: {
            answer: {
              bike: { title_multiloc: { en: 'By bike' } },
              bus: { title_multiloc: { en: 'By bus or tram' } },
              car: { title_multiloc: { en: 'By car' } },
            },
          },
          customFieldId: '654c3a46-9e64-44a0-96e5-f350b471fc23',
        },
      ],
    },
  },
};

const respond = (body: SurveyResultsType) =>
  mockEndpoints({
    'GET phases/:id/survey_results': http.get(phaseApiPath, () =>
      HttpResponse.json(body, { status: 200 })
    ),
  });

// It renders once the project and the survey results (MSW) have loaded, so
// the play step waits for the heading.
const meta = {
  title: 'Components/Data display/FormResults',
  tags: ['shared'],
  parameters: { gv: {}, msw: respond(results) },
  component: FormResults,
  args: { projectId: '1', phaseId: '1' },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      if (!canvasElement.querySelector('h2')?.textContent) {
        throw new Error('results not rendered yet');
      }
    });
  },
} satisfies Meta<typeof FormResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    msw: respond({
      data: {
        type: 'survey_results',
        attributes: { totalSubmissions: 0, results: [] },
      },
    }),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};

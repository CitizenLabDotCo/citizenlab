import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { SurveyResultsType } from '../types';

export const projectApiPath = `${API_PATH}/projects/:projectId/survey_results`;
export const phaseApiPath = `${API_PATH}/phases/:phaseId/survey_results`;

export const surveyResultsResponse: SurveyResultsType = {
  data: {
    type: 'survey_results',
    attributes: {
      results: [
        {
          inputType: 'select',
          question: {
            en: 'Your question',
          },
          required: false,
          grouped: false,
          totalResponseCount: 1,
          questionResponseCount: 1,
          totalPickCount: 1,
          description: {},
          questionNumber: 1,
          pageNumber: 1,
          hidden: false,
          logic: {},
          answers: [
            {
              answer: 'option1',
              count: 1,
            },
          ],
          multilocs: {
            answer: {
              option1: {
                title_multiloc: { en: 'Option 1' },
              },
            },
          },
          customFieldId: '654c3a46-9e64-44a0-96e5-f350b471fc23',
        },
        {
          inputType: 'select',
          question: {
            en: 'Single choice',
          },
          required: true,
          grouped: false,
          totalResponseCount: 1,
          questionResponseCount: 1,
          totalPickCount: 1,
          description: {},
          questionNumber: 1,
          pageNumber: 1,
          hidden: false,
          logic: {},
          answers: [
            {
              answer: 'option_a',
              count: 1,
            },
          ],
          multilocs: {
            answer: {
              option_a: {
                title_multiloc: { en: 'Option A' },
              },
            },
          },
          customFieldId: '548f7849-837f-447e-831a-51050a403a3b',
        },
      ],
      totalSubmissions: 1,
    },
  },
};

const endpoints = {
  'GET projects/:id/survey_results': http.get(projectApiPath, () => {
    return HttpResponse.json(surveyResultsResponse, { status: 200 });
  }),
  'GET phases/:id/survey_results': http.get(phaseApiPath, () => {
    return HttpResponse.json(surveyResultsResponse, { status: 200 });
  }),
};

export default endpoints;

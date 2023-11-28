import { API_PATH } from 'containers/App/constants';
import { rest } from 'msw';
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
          totalResponses: 1,
          answers: [
            {
              answer: {
                en: 'Option 1',
              },
              responses: 1,
            },
          ],
          customFieldId: '654c3a46-9e64-44a0-96e5-f350b471fc23',
        },
        {
          inputType: 'select',
          question: {
            en: 'Single choice',
          },
          required: true,
          totalResponses: 1,
          answers: [
            {
              answer: {
                en: 'Option A',
              },
              responses: 1,
            },
          ],
          customFieldId: '548f7849-837f-447e-831a-51050a403a3b',
        },
        {
          inputType: 'multiline_text',
          question: {
            en: 'question',
          },
          required: false,
          totalResponses: 1,
          customFieldId: '052befb9-b096-4ded-ba1d-3ee2541bde31',
        },
      ],
      totalSubmissions: 1,
    },
  },
};

const endpoints = {
  'GET projects/:id/survey_results': rest.get(
    projectApiPath,
    (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(surveyResultsResponse));
    }
  ),
  'GET phases/:id/survey_results': rest.get(phaseApiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(surveyResultsResponse));
  }),
};

export default endpoints;

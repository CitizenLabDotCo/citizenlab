import { setSurveyFields } from '../native_survey/utils';

type Multiloc = Record<string, string>;

type RuleParams = { if: string | number; goto_page_id: string };
type FieldParams = Record<string, unknown>;

export type SavedRule = { if: string | number | null; goto_page_id: string };
export type SavedLogic = { rules?: SavedRule[]; next_page_id?: string };

export type CustomFieldResource = {
  id: string;
  type: string;
  attributes: {
    key: string;
    input_type: string;
    title_multiloc: Multiloc;
    logic: SavedLogic;
  };
};

type IncludedResource = {
  id: string;
  type: string;
  attributes: { key?: string; title_multiloc?: Multiloc; temp_id?: string };
};

export type CustomFieldsResponse = {
  data: CustomFieldResource[];
  included?: IncludedResource[];
};

export type LogicSurvey = {
  projectId: string;
  projectSlug: string;
  phaseId: string;
  fields: CustomFieldsResponse;
};

// Pages and options are created with a temp_id that rules can point at; the
// update_all endpoint swaps those for the real ids when it saves the logic.
const pageField = ({
  tempId,
  title,
  key,
  nextPageTempId,
}: {
  tempId: string;
  title: string;
  key?: 'page1' | 'form_end';
  nextPageTempId?: string;
}): FieldParams => ({
  temp_id: tempId,
  input_type: 'page',
  logic: nextPageTempId ? { next_page_id: nextPageTempId } : {},
  required: false,
  enabled: true,
  title_multiloc: { en: title },
  description_multiloc: {},
  ...(key ? { key, code: null } : {}),
  page_layout: 'default',
  page_button_label_multiloc: {},
  page_button_link: '',
  include_in_printed_form: key !== 'form_end',
});

export const firstPage = (tempId: string, nextPageTempId?: string) =>
  pageField({ tempId, title: 'Page one', key: 'page1', nextPageTempId });

export const page = (tempId: string, title: string, nextPageTempId?: string) =>
  pageField({ tempId, title, nextPageTempId });

export const endPage = (tempId: string) =>
  pageField({
    tempId,
    title: 'Thank you for sharing your input!',
    key: 'form_end',
  });

const logicFor = (rules: RuleParams[]) => (rules.length > 0 ? { rules } : {});

export const selectQuestion = ({
  title,
  options,
  rules = [],
}: {
  title: string;
  options: { tempId: string; title: string }[];
  rules?: RuleParams[];
}): FieldParams => ({
  input_type: 'select',
  logic: logicFor(rules),
  required: false,
  enabled: true,
  title_multiloc: { en: title },
  description_multiloc: {},
  options: options.map((option) => ({
    temp_id: option.tempId,
    title_multiloc: { en: option.title },
    other: false,
  })),
  maximum_select_count: null,
  minimum_select_count: null,
  random_option_ordering: false,
  dropdown_layout: false,
});

const scaleQuestion = (
  inputType: 'linear_scale' | 'rating',
  { title, rules = [] }: { title: string; rules?: RuleParams[] }
): FieldParams => ({
  input_type: inputType,
  logic: logicFor(rules),
  required: false,
  enabled: true,
  title_multiloc: { en: title },
  description_multiloc: {},
  maximum: 5,
});

export const linearScaleQuestion = (params: {
  title: string;
  rules?: RuleParams[];
}) => scaleQuestion('linear_scale', params);

export const ratingQuestion = (params: {
  title: string;
  rules?: RuleParams[];
}) => scaleQuestion('rating', params);

export const textQuestion = (title: string): FieldParams => ({
  input_type: 'text',
  logic: {},
  required: false,
  enabled: true,
  title_multiloc: { en: title },
  description_multiloc: {},
});

export const createSurveyWithFields = (fields: FieldParams[]) =>
  cy
    .createProjectWithNativeSurveyPhase()
    .then(({ projectId, projectSlug, phaseId }) =>
      setSurveyFields(cy, phaseId, fields).then((response) => {
        const body: CustomFieldsResponse = response.body;
        const survey: LogicSurvey = {
          projectId,
          projectSlug,
          phaseId,
          fields: body,
        };
        return survey;
      })
    );

export const fieldByTitle = (fields: CustomFieldsResponse, title: string) => {
  const field = fields.data.find(
    (field) => field.attributes.title_multiloc.en === title
  );
  if (!field) throw new Error(`No field titled "${title}"`);
  return field;
};

export const optionByTitle = (fields: CustomFieldsResponse, title: string) => {
  const option = (fields.included ?? []).find(
    (resource) =>
      resource.type === 'custom_field_option' &&
      resource.attributes.title_multiloc?.en === title
  );
  if (!option) throw new Error(`No option titled "${title}"`);
  return option;
};

export const adminRequest = <T>(options: Partial<Cypress.RequestOptions>) =>
  cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) =>
    cy.requestAs<T>(response.body.jwt, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  );

export const visitSurvey = (survey: LogicSurvey) => {
  cy.visit(`/projects/${survey.projectSlug}/surveys/new/${survey.phaseId}`);
  cy.dataCy('e2e-page-number-1').should('exist');
};

export const visitSurveyBuilder = (survey: LogicSurvey) => {
  cy.visit(
    `/admin/projects/${survey.projectId}/phases/${survey.phaseId}/survey-form/edit`
  );
};

export const pickOption = (title: string) => {
  cy.contains('[data-testid="radio-container"]', title).click();
};

export const goToPreviousPage = () => {
  cy.dataCy('e2e-previous-page').click();
};

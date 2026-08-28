import React from 'react';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import { SEARCHABLE_OPTION_COUNT } from '../constants';

import SurveyForm from './index';

// PageControlButtons uses IntersectionObserver to enable the Next/Submit
// button once the bottom of the page is visible. jsdom has no layout, so we
// stub IntersectionObserver to fire `isIntersecting: true` immediately when an
// element is observed — otherwise the Next button stays disabled forever.
class IntersectionObserverStub {
  constructor(private callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(
  global as unknown as { IntersectionObserver: typeof IntersectionObserverStub }
).IntersectionObserver = IntersectionObserverStub;

const mockAddIdea = jest.fn(() =>
  Promise.resolve({ data: { id: 'new-idea-id' } })
);
const mockUpdateIdea = jest.fn();

// Anonymous user (permitted_by: 'everyone' flow)
jest.mock('api/me/useAuthUser', () => () => ({ data: undefined }));

// No server-side draft for anonymous users — intermediate page submits no-op
jest.mock('api/ideas/useDraftIdeaByPhaseId', () => ({
  __esModule: true,
  default: () => ({ data: undefined, isLoading: false }),
  clearDraftIdea: () => undefined,
}));

jest.mock('api/ideas/useAddIdea', () => () => ({ mutateAsync: mockAddIdea }));
jest.mock('api/ideas/useUpdateIdea', () => () => ({
  mutateAsync: mockUpdateIdea,
}));
jest.mock('api/ideas/useIdeaById', () => () => ({ data: undefined }));

jest.mock('api/projects/useProjectById', () => () => ({
  data: { data: { id: 'project-1', attributes: { slug: 'my-project' } } },
}));

const phaseData = {
  id: 'phase-1',
  attributes: {
    title_multiloc: { en: 'My Phase' },
    participation_method: 'native_survey',
    user_fields_in_form_enabled: false,
    input_term: 'idea',
  },
};
jest.mock('api/phases/usePhase', () => () => ({ data: { data: phaseData } }));
jest.mock('api/phases/usePhases', () => () => ({
  data: { data: [phaseData] },
}));

const customFields = [
  {
    id: 'page-1',
    type: 'custom_field',
    key: 'page_1',
    input_type: 'page',
    title_multiloc: { en: 'Page 1' },
    description_multiloc: {},
    required: false,
    enabled: true,
    ordering: 0,
    created_at: '',
    updated_at: '',
    logic: {},
    page_layout: 'default',
    matrix_statements: [],
    options: [],
  },
  {
    id: 'q1',
    type: 'custom_field',
    key: 'question_one',
    input_type: 'text',
    title_multiloc: { en: 'Question One' },
    description_multiloc: {},
    required: true,
    enabled: true,
    ordering: 1,
    created_at: '',
    updated_at: '',
    logic: { rules: [] },
  },
  {
    id: 'page-2',
    type: 'custom_field',
    key: 'page_2',
    input_type: 'page',
    title_multiloc: { en: 'Page 2' },
    description_multiloc: {},
    required: false,
    enabled: true,
    ordering: 2,
    created_at: '',
    updated_at: '',
    logic: {},
    page_layout: 'default',
    matrix_statements: [],
    options: [],
  },
  {
    id: 'q2',
    type: 'custom_field',
    key: 'question_two',
    input_type: 'text',
    title_multiloc: { en: 'Question Two' },
    description_multiloc: {},
    required: true,
    enabled: true,
    ordering: 3,
    created_at: '',
    updated_at: '',
    logic: { rules: [] },
  },
  {
    id: 'page-end',
    type: 'custom_field',
    key: 'form_end',
    input_type: 'page',
    title_multiloc: { en: 'Thank you' },
    description_multiloc: {},
    required: false,
    enabled: true,
    ordering: 4,
    created_at: '',
    updated_at: '',
    logic: {},
    page_layout: 'default',
    matrix_statements: [],
    options: [],
  },
];

let mockCustomFieldsQuery: { data?: typeof customFields; isLoading: boolean } =
  {
    data: customFields,
    isLoading: false,
  };

jest.mock(
  'api/custom_fields/useCustomFields',
  () => () => mockCustomFieldsQuery
);

jest.mock('utils/router', () => ({
  useLocation: () => ({ pathname: '/projects/my-project/survey' }),
  useSearch: () => ({}),
}));

jest.mock('utils/permissions/rules/projectPermissions', () => ({
  canModerateProject: () => false,
}));

// The Esri-map hook would otherwise pull in map_config API hooks we don't care
// about for this test.
jest.mock('components/CustomFieldsForm/Map/useEsriMapPage', () => () => ({
  mapConfig: null,
  mapLayers: [],
  draggableDivRef: { current: null },
  dragDividerRef: { current: null },
}));

// CustomFields statically imports MapField, which loads @arcgis/core (lit-html
// ESM that jest can't transform). The survey under test has no map pages, so
// stub MapField and the map-page chrome to break the import chain.
jest.mock('components/CustomFieldsForm/Fields/MapField', () => () => null);
jest.mock('components/CustomFieldsForm/Map/PageEsriMap', () => () => null);
jest.mock('components/CustomFieldsForm/Map/PageEsriDivider', () => () => null);

describe('SurveyForm — anonymous multi-page persistence', () => {
  beforeEach(() => {
    mockAddIdea.mockClear();
    mockUpdateIdea.mockClear();
    mockCustomFieldsQuery = { data: customFields, isLoading: false };
  });

  // A select question carries its options in the custom_fields response, so a
  // question with thousands of them leaves the form blank for seconds.
  it('shows a spinner while the questions are still loading', () => {
    mockCustomFieldsQuery = { data: undefined, isLoading: true };

    render(
      <SurveyForm
        projectId="project-1"
        phaseId="phase-1"
        participationMethod="native_survey"
      />
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.queryByText(/Question One/i)).not.toBeInTheDocument();
  });

  // Regression test for the bug introduced by adding `key={currentPageIndex}`
  // to <SurveyPage> in SurveyForm/index.tsx (commit 04585b1e00f, PR #13965).
  //
  // For anonymous users, SurveyForm.onSubmit returns early on every page that
  // is not the final submit page, so nothing is persisted server-side between
  // pages. Before the key was added, the React Hook Form instance inside
  // SurveyPage persisted across page transitions, so the accumulated form
  // values were all sent in the final addIdea POST. After the key was added,
  // SurveyPage unmounts and remounts on every page change, destroying the
  // form state. Every answer from a non-final page is silently lost.
  //
  // This test must FAIL while that regression is present and PASS once the
  // anonymous-flow persistence is restored (e.g. by hoisting form values into
  // SurveyForm so they survive the remount).
  it('sends page 1 answers in the final addIdea payload', async () => {
    const user = userEvent.setup();

    render(
      <SurveyForm
        projectId="project-1"
        phaseId="phase-1"
        participationMethod="native_survey"
      />
    );

    // Page 1 — fill in the required question
    const q1 = await screen.findByLabelText(/Question One/i);
    await user.type(q1, 'page-1-answer');

    // Advance to page 2. For anonymous users this triggers no save.
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Page 2 — fill in the required question.
    const q2 = await screen.findByLabelText(/Question Two/i);
    await user.type(q2, 'page-2-answer');

    // Submit. The next page is the end page → isSubmitPage is true →
    // addIdea is called with the full form payload.
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(mockAddIdea).toHaveBeenCalledTimes(1));

    // The bug: addIdea is called with only `question_two` because the
    // page-1 form state was destroyed by the page-transition remount.
    expect(mockAddIdea).toHaveBeenCalledWith(
      expect.objectContaining({
        phaseId: 'phase-1',
        requestBody: expect.objectContaining({
          question_one: 'page-1-answer',
          question_two: 'page-2-answer',
        }),
      })
    );
  });

  const renderWithDropdown = (inputType: string) => {
    mockCustomFieldsQuery = {
      data: [
        customFields[0],
        {
          ...customFields[1],
          input_type: inputType,
          required: false,
          dropdown_layout: true,
          options: Array.from(
            { length: SEARCHABLE_OPTION_COUNT },
            (_, index) => ({
              id: `option-${index}`,
              key: `option_${index + 1}`,
              title_multiloc: { en: `Option ${index + 1}` },
            })
          ),
        },
        ...customFields.slice(2),
      ] as typeof customFields,
      isLoading: false,
    };

    render(
      <SurveyForm
        projectId="project-1"
        phaseId="phase-1"
        participationMethod="native_survey"
      />
    );
  };

  // A dropdown's search box is a text input, and the form submits the page on
  // Enter in a text input. Enter has to reach the dropdown only.
  it.each(['select', 'multiselect'])(
    'does not advance the page when Enter picks an option in a %s dropdown',
    async (inputType) => {
      const user = userEvent.setup();
      renderWithDropdown(inputType);

      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{Enter}');

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.queryByText(/Question Two/i)).not.toBeInTheDocument();
    }
  );

  // A search that matches nothing leaves the dropdown with no option to pick,
  // so it does nothing with the Enter it is given.
  it.each(['select', 'multiselect'])(
    'does not advance the page when a %s dropdown search matches nothing',
    async (inputType) => {
      const user = userEvent.setup();
      renderWithDropdown(inputType);

      await user.click(screen.getByRole('combobox'));
      await user.keyboard('no such option{Enter}');

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.queryByText(/Question Two/i)).not.toBeInTheDocument();
    }
  );
});

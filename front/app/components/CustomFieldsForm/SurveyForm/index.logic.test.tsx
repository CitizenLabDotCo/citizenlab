import React from 'react';

import { LogicType } from 'api/custom_fields/types';

import { makeCustomField } from 'utils/testUtils/customFields';
import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

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

let mockAuthUser: { data: { id: string; attributes: object } } | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

jest.mock('utils/analytics', () => ({
  ...jest.requireActual('utils/analytics'),
  trackEventByName: jest.fn(),
}));

// No server-side draft for anonymous users — intermediate page submits no-op
let mockDraftIdeaQuery: {
  data?: { data: { id?: string } };
  isLoading: boolean;
  isSuccess: boolean;
  isPlaceholderData: boolean;
  dataUpdatedAt: number;
} = {
  data: undefined,
  isLoading: false,
  isSuccess: true,
  isPlaceholderData: false,
  dataUpdatedAt: 1,
};
jest.mock('api/ideas/useDraftIdeaByPhaseId', () => ({
  __esModule: true,
  default: () => mockDraftIdeaQuery,
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

const page = (id: string, title: string, logic: LogicType = {}) =>
  makeCustomField({
    id,
    key: id === 'page-end' ? 'form_end' : id.replace('-', '_'),
    input_type: 'page',
    title_multiloc: { en: title },
    logic,
    page_layout: 'default',
    options: [],
  });

const textQuestion = (id: string, title: string) =>
  makeCustomField({
    id,
    key: id,
    input_type: 'text',
    title_multiloc: { en: title },
    logic: { rules: [] },
  });

// Option ids differ from the keys that answers hold, as with real data.
const choiceQuestion = (rules: LogicType['rules']) =>
  makeCustomField({
    id: 'choice',
    key: 'choice',
    input_type: 'select',
    title_multiloc: { en: 'Pick one' },
    options: [
      { id: 'id-yes', key: 'yes', title_multiloc: { en: 'Yes' } },
      { id: 'id-no', key: 'no', title_multiloc: { en: 'No' } },
      { id: 'id-maybe', key: 'maybe', title_multiloc: { en: 'Maybe' } },
    ],
    logic: { rules },
  });

const buildForm = ({
  firstPageLogic = {},
  rules = [
    { if: 'id-yes', goto_page_id: 'page-end' },
    { if: 'id-no', goto_page_id: 'page-3' },
  ],
}: {
  firstPageLogic?: LogicType;
  rules?: LogicType['rules'];
} = {}) => [
  page('page-1', 'First page', firstPageLogic),
  choiceQuestion(rules),
  page('page-2', 'Second page'),
  textQuestion('q_two', 'Question Two'),
  page('page-3', 'Third page'),
  textQuestion('q_three', 'Question Three'),
  page('page-end', 'Thank you'),
];

let mockCustomFields = buildForm();
jest.mock('api/custom_fields/useCustomFields', () => () => ({
  data: mockCustomFields,
  isLoading: false,
}));

jest.mock('utils/router', () => ({
  useLocation: () => ({ pathname: '/projects/my-project/survey' }),
  useSearch: () => ({}),
}));

jest.mock('utils/permissions/rules/projectPermissions', () => ({
  canModerateProject: () => false,
}));

jest.mock('components/CustomFieldsForm/Map/useEsriMapPage', () => () => ({
  mapConfig: null,
  mapLayers: [],
  draggableDivRef: { current: null },
  dragDividerRef: { current: null },
}));
jest.mock('components/CustomFieldsForm/Fields/MapField', () => () => null);
jest.mock('components/CustomFieldsForm/Map/PageEsriMap', () => () => null);
jest.mock('components/CustomFieldsForm/Map/PageEsriDivider', () => () => null);

const renderSurvey = () =>
  render(
    <SurveyForm
      projectId="project-1"
      phaseId="phase-1"
      participationMethod="native_survey"
    />
  );

const choose = (user: ReturnType<typeof userEvent.setup>, label: string) =>
  user.click(screen.getByRole('radio', { name: label }));

const clickNext = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /next/i }));

const clickPrevious = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /previous/i }));

describe('SurveyForm with logic', () => {
  beforeEach(() => {
    mockAddIdea.mockClear();
    mockUpdateIdea.mockClear();
    mockAuthUser = undefined;
    mockDraftIdeaQuery = {
      data: undefined,
      isLoading: false,
      isSuccess: true,
      isPlaceholderData: false,
      dataUpdatedAt: 1,
    };
    mockCustomFields = buildForm();
  });

  it('switches the button to Submit when the chosen answer jumps to the end', async () => {
    const user = userEvent.setup();
    renderSurvey();

    expect(
      await screen.findByRole('button', { name: /next/i })
    ).toBeInTheDocument();

    await choose(user, 'Yes');
    expect(
      await screen.findByRole('button', { name: /submit/i })
    ).toBeInTheDocument();

    await choose(user, 'No');
    expect(
      await screen.findByRole('button', { name: /next/i })
    ).toBeInTheDocument();
  });

  it('submits the survey from the first page when the answer jumps to the end', async () => {
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'Yes');
    await user.click(await screen.findByRole('button', { name: /submit/i }));

    await waitFor(() => expect(mockAddIdea).toHaveBeenCalledTimes(1));
    expect(mockAddIdea).toHaveBeenCalledWith({
      phaseId: 'phase-1',
      requestBody: { choice: 'yes', publication_status: 'published' },
    });
    expect(await screen.findByText('Thank you')).toBeInTheDocument();
  });

  it('lands on the target page of the chosen answer', async () => {
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'No');
    await clickNext(user);

    expect(await screen.findByText('Question Three')).toBeInTheDocument();
    expect(screen.queryByText('Question Two')).not.toBeInTheDocument();
  });

  it('does not follow the any-other-answer rule of a select and goes to the next page (currently existing bug, B2)', async () => {
    mockCustomFields = buildForm({
      rules: [
        { if: 'id-yes', goto_page_id: 'page-end' },
        { if: 'any_other_answer', goto_page_id: 'page-3' },
      ],
    });
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'Maybe');
    await clickNext(user);

    expect(await screen.findByText('Question Two')).toBeInTheDocument();
  });

  it('goes to the next page, not the page default, when the answer matches no rule (currently existing bug, B6)', async () => {
    mockCustomFields = buildForm({
      firstPageLogic: { next_page_id: 'page-3' },
      rules: [{ if: 'id-yes', goto_page_id: 'page-end' }],
    });
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'No');
    await clickNext(user);

    expect(await screen.findByText('Question Two')).toBeInTheDocument();
  });

  it('follows the page default when no question on the page has rules', async () => {
    mockCustomFields = buildForm({
      firstPageLogic: { next_page_id: 'page-3' },
      rules: [],
    });
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'No');
    await clickNext(user);

    expect(await screen.findByText('Question Three')).toBeInTheDocument();
  });

  it('goes back along the pages the respondent visited', async () => {
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'No');
    await clickNext(user);
    expect(await screen.findByText('Question Three')).toBeInTheDocument();

    await clickPrevious(user);

    expect(await screen.findByText('Pick one')).toBeInTheDocument();
    expect(screen.queryByText('Question Two')).not.toBeInTheDocument();
  });

  it('sends the answers of every page on the path taken', async () => {
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'Maybe');
    await clickNext(user);
    await user.type(await screen.findByLabelText(/Question Two/), 'visited');
    await clickNext(user);
    await user.type(await screen.findByLabelText(/Question Three/), 'kept');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(mockAddIdea).toHaveBeenCalledTimes(1));
    expect(mockAddIdea).toHaveBeenCalledWith({
      phaseId: 'phase-1',
      requestBody: {
        choice: 'maybe',
        q_two: 'visited',
        q_three: 'kept',
        publication_status: 'published',
      },
    });
  });

  it('does not send the answers of a page that a changed answer now skips', async () => {
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'Maybe');
    await clickNext(user);
    await user.type(await screen.findByLabelText(/Question Two/), 'skipped');
    await clickNext(user);
    await screen.findByText('Question Three');
    await clickPrevious(user);
    await screen.findByText('Question Two');
    await clickPrevious(user);

    await choose(user, 'No');
    await clickNext(user);
    await user.type(await screen.findByLabelText(/Question Three/), 'kept');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(mockAddIdea).toHaveBeenCalledTimes(1));
    expect(mockAddIdea).toHaveBeenCalledWith({
      phaseId: 'phase-1',
      requestBody: expect.objectContaining({
        choice: 'no',
        q_three: 'kept',
        publication_status: 'published',
      }),
    });
    expect(mockAddIdea).toHaveBeenCalledWith({
      phaseId: 'phase-1',
      requestBody: expect.not.objectContaining({ q_two: expect.anything() }),
    });
  });

  it('erases the answer on a later page when an answer that skips it is picked and then undone (currently existing bug, N7)', async () => {
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'Maybe');
    await clickNext(user);
    await user.type(await screen.findByLabelText(/Question Two/), 'long text');
    await clickPrevious(user);
    await screen.findByText('Pick one');
    await clickNext(user);
    expect(await screen.findByLabelText(/Question Two/)).toHaveValue(
      'long text'
    );
    await clickPrevious(user);
    await screen.findByText('Pick one');

    await choose(user, 'No');
    await choose(user, 'Maybe');
    await clickNext(user);

    expect(await screen.findByLabelText(/Question Two/)).toHaveValue('');
  });

  it('renders no page and no buttons after a jump to a page that is not in the form (currently existing bug, N9)', async () => {
    mockCustomFields = buildForm({
      rules: [{ if: 'id-no', goto_page_id: 'page-missing' }],
    });
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'No');
    await clickNext(user);

    await waitFor(() =>
      expect(screen.queryByText('Pick one')).not.toBeInTheDocument()
    );
    expect(screen.queryByText('Question Two')).not.toBeInTheDocument();
    expect(screen.queryByText('Question Three')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /next|submit/i })
    ).not.toBeInTheDocument();
  });

  it('saves the draft of a signed-in respondent on every page it visits', async () => {
    mockAuthUser = { data: { id: 'user-1', attributes: {} } };
    mockDraftIdeaQuery = {
      data: { data: { id: 'draft-1' } },
      isLoading: false,
      isSuccess: true,
      isPlaceholderData: false,
      dataUpdatedAt: 1,
    };
    const user = userEvent.setup();
    renderSurvey();

    await choose(user, 'No');
    await clickNext(user);
    await user.type(await screen.findByLabelText(/Question Three/), 'done');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(mockUpdateIdea).toHaveBeenCalledTimes(2));
    expect(mockUpdateIdea).toHaveBeenNthCalledWith(1, {
      id: 'draft-1',
      requestBody: expect.objectContaining({
        choice: 'no',
        publication_status: 'draft',
      }),
    });
    expect(mockUpdateIdea).toHaveBeenNthCalledWith(2, {
      id: 'draft-1',
      requestBody: expect.objectContaining({
        choice: 'no',
        q_three: 'done',
        publication_status: 'published',
      }),
    });
    expect(mockAddIdea).not.toHaveBeenCalled();
  });
});

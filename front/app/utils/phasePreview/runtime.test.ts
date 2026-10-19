import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { createPreviewFetch } from './runtime';
import { PreviewSession } from './session';
import { PreviewSnapshot } from './types';

const snapshot: PreviewSnapshot = {
  project: project1,
  phase: phasesData[0],
  draft: {},
};
const origin = 'https://demo.stg.govocal.com';
const phaseId = phasesData[0].id;

const setup = () => {
  const network = jest.fn(
    async () =>
      new Response(JSON.stringify({ data: [] }), {
        headers: { 'Content-Type': 'application/json' },
      })
  );
  const blocked = jest.fn();
  const session = new PreviewSession(snapshot);
  const fetch = createPreviewFetch(session, network, origin, blocked);
  const request = (path: string, method: string, body = {}) =>
    fetch(`${origin}/web_api/v1${path}`, {
      method,
      body: method === 'GET' ? undefined : JSON.stringify(body),
    });

  return { network, blocked, request, session, fetch };
};

it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
  'blocks unknown %s requests without contacting the server',
  async (method) => {
    const { request, network, blocked } = setup();
    const response = await request('/users/me', method, {
      user: { first_name: 'Changed' },
    });

    expect(response.status).toBe(422);
    expect(network).not.toHaveBeenCalled();
    expect(blocked).toHaveBeenCalledTimes(1);
  }
);

it('blocks external writes, including Request objects', async () => {
  const { fetch, network } = setup();
  const response = await fetch(
    new Request('https://external.example/submit', {
      method: 'POST',
      body: 'test',
    })
  );

  expect(response.status).toBe(422);
  expect(network).not.toHaveBeenCalled();
});

it('keeps survey page autosaves, final submissions and refetched drafts local', async () => {
  const { request, network } = setup();
  const response = await request(`/phases/${phaseId}/inputs`, 'POST', {
    idea: {
      publication_status: 'draft',
      custom_field_values: { answer: 'First page' },
    },
  });
  const created = await response.json();

  await request(`/ideas/${created.data.id}`, 'PATCH', {
    idea: {
      publication_status: 'published',
      custom_field_values: { answer: 'Final page' },
    },
  });
  const draft = await (await request(`/ideas/draft/${phaseId}`, 'GET')).json();

  expect(draft.data.attributes.custom_field_values.answer).toBe('Final page');
  expect(draft.data.attributes.publication_status).toBe('published');
  expect(network).not.toHaveBeenCalled();
});

it.each(['budgeting', 'single_voting', 'multiple_voting'])(
  'keeps %s selections and basket submission local',
  async (votingMethod) => {
    const { request, network } = setup();

    await request('/baskets/ideas/option-1', 'PUT', {
      baskets_idea: { votes: votingMethod === 'multiple_voting' ? 3 : 1 },
    });
    await request('/baskets/preview-basket', 'PATCH', {
      basket: { submitted: true },
    });
    const basket = await (
      await request('/baskets/preview-basket', 'GET')
    ).json();
    const choices = await (
      await request('/baskets/preview-basket/baskets_ideas', 'GET')
    ).json();

    expect(basket.data.attributes.submitted_at).toBeTruthy();
    expect(choices.data).toHaveLength(1);
    expect(network).not.toHaveBeenCalled();
  }
);

it.each([
  [
    `/phases/${phaseId}/poll_responses`,
    { response: { response_options_attributes: [{ option_id: 'option-1' }] } },
  ],
  ['/causes/cause-1/volunteers', {}],
  ['/events/event-1/attendances', { attendance: {} }],
  ['/ideas/statement-1/reactions', { reaction: { mode: 'up' } }],
])('keeps participation at %s local', async (path, body) => {
  const { request, network } = setup();

  expect((await request(path, 'POST', body)).ok).toBe(true);
  expect(network).not.toHaveBeenCalled();
});

it('starts a new preview without previous test answers or the real user draft', async () => {
  const first = setup();
  await first.request(`/phases/${phaseId}/inputs`, 'POST', {
    idea: { title_multiloc: { en: 'Private test' } },
  });

  const second = setup();
  const draft = await (
    await second.request(`/ideas/draft/${phaseId}`, 'GET')
  ).json();
  expect(draft.data.id).toBeUndefined();
  expect(second.network).not.toHaveBeenCalled();
});

it('preserves server access and lifecycle restrictions', () => {
  const phase = {
    ...phasesData[0],
    attributes: {
      ...phasesData[0].attributes,
      action_descriptors: {
        ...phasesData[0].attributes.action_descriptors,
        posting_idea: { enabled: false, disabled_reason: 'user_not_in_group' },
        voting: { enabled: false, disabled_reason: 'inactive_phase' },
      },
    },
  };
  const { session } = setup();
  const result = session.transform(JSON.parse(JSON.stringify({ data: phase })));

  // The selected phase comes from the editor snapshot, not an unrelated server payload.
  expect(result.data).toBeDefined();
  const other = session.transform({
    data: {
      id: 'idea-1',
      type: 'idea',
      attributes: { action_descriptors: phase.attributes.action_descriptors },
    },
  });
  expect(other).toMatchObject({
    data: {
      attributes: {
        action_descriptors: {
          posting_idea: {
            enabled: false,
            disabled_reason: 'user_not_in_group',
          },
          voting: { enabled: false, disabled_reason: 'inactive_phase' },
        },
      },
    },
  });
});

it('does not mutate the parent snapshot when preparing preview data', async () => {
  const { session } = setup();
  const before = JSON.stringify(snapshot);

  session.read(`/phases/${phaseId}`);
  session.transform({
    data: {
      id: project1.id,
      type: 'project',
      attributes: { publication_status: 'draft' },
      relationships: {},
    },
  });

  expect(JSON.stringify(snapshot)).toBe(before);
});

it('blocks malformed write bodies without forwarding them', async () => {
  const { fetch, network, blocked } = setup();
  const response = await fetch(`${origin}/web_api/v1/ideas`, {
    method: 'POST',
    body: '{invalid',
  });

  expect(response.status).toBe(422);
  expect(network).not.toHaveBeenCalled();
  expect(blocked).toHaveBeenCalled();
});

it('keeps event attendance and cancellation isolated from the real account', async () => {
  const { request, network, session } = setup();
  session.transform({
    data: { id: 'event-1', type: 'event', attributes: {}, relationships: {} },
  });

  expect(
    (await (await request('/users/me/events', 'GET')).json()).data
  ).toEqual([]);
  await request('/events/event-1/attendances', 'POST');
  const attending = await (await request('/users/me/events', 'GET')).json();
  expect(attending.data).toHaveLength(1);
  expect(attending.data[0].relationships.user_attendance.data.id).toBe(
    'preview-event-1'
  );

  await request('/event_attendances/preview-event-1', 'DELETE');
  expect(
    (await (await request('/users/me/events', 'GET')).json()).data
  ).toEqual([]);
  expect(network).not.toHaveBeenCalled();
});

it('returns poll completion through the same included phase contract as the public API', async () => {
  const { request } = setup();
  const result = await (
    await request(`/phases/${phaseId}/poll_responses`, 'POST')
  ).json();

  expect(result.included[0].attributes.action_descriptors.taking_poll).toEqual({
    enabled: false,
    disabled_reason: 'already_responded',
  });
});

it('preserves configured dates and publication state', () => {
  const session = new PreviewSession(snapshot);
  expect(session.read(`/phases/${phaseId}`)).toMatchObject({
    data: {
      attributes: {
        start_at: phasesData[0].attributes.start_at,
        end_at: phasesData[0].attributes.end_at,
      },
    },
  });

  expect(
    session.transform(JSON.parse(JSON.stringify({ data: project1 })))
  ).toMatchObject({
    data: {
      attributes: {
        publication_status: project1.attributes.publication_status,
      },
      relationships: { current_phase: project1.relationships.current_phase },
    },
  });
});

it('advances common-ground statements using local reactions', () => {
  const session = new PreviewSession(snapshot);
  session.setStatements({
    data: [
      { id: 'a', type: 'idea' },
      { id: 'b', type: 'idea' },
    ],
  });
  session.write('/ideas/a/reactions', 'POST', { reaction: { mode: 'up' } });

  expect(
    session.transform({
      data: {
        id: phaseId,
        type: 'common_ground_progress',
        attributes: { num_ideas: 2 },
      },
    })
  ).toMatchObject({
    data: {
      attributes: { num_ideas: 2, num_reacted_ideas: 1 },
      relationships: { next_idea: { data: { id: 'b', type: 'idea' } } },
    },
  });
});

it('updates phase edits without clearing local answers, votes or completion', async () => {
  const { session, request, network } = setup();
  const created = await (
    await request(`/phases/${phaseId}/inputs`, 'POST', {
      idea: { custom_field_values: { answer: 'Keep my answer' } },
    })
  ).json();
  await request('/baskets/ideas/option-1', 'PUT', {
    baskets_idea: { votes: 2 },
  });
  await request(`/phases/${phaseId}/poll_responses`, 'POST');

  expect(
    session.updateSnapshot({
      ...snapshot,
      draft: {
        title_multiloc: { en: 'Edited title' },
        description_multiloc: { en: '<p>Edited description</p>' },
      },
    })
  ).toBe(true);

  const phase = await (await request(`/phases/${phaseId}`, 'GET')).json();
  const draft = await (await request(`/ideas/draft/${phaseId}`, 'GET')).json();
  const basket = await (await request('/baskets/preview-basket', 'GET')).json();

  expect(phase.data.attributes.title_multiloc.en).toBe('Edited title');
  expect(phase.data.attributes.description_multiloc.en).toBe(
    '<p>Edited description</p>'
  );
  expect(
    phase.data.attributes.action_descriptors.taking_poll.disabled_reason
  ).toBe('already_responded');
  expect(draft.data.id).toBe(created.data.id);
  expect(draft.data.attributes.custom_field_values.answer).toBe(
    'Keep my answer'
  );
  expect(basket.data.attributes.total_votes).toBe(2);
  expect(network).not.toHaveBeenCalled();
});

it('ignores duplicate snapshots and rejects another phase or project', () => {
  const { session } = setup();

  expect(session.updateSnapshot(snapshot)).toBe(false);
  expect(
    session.updateSnapshot({
      ...snapshot,
      phase: { ...snapshot.phase, id: 'another-phase' },
    })
  ).toBe(false);
  expect(
    session.updateSnapshot({
      ...snapshot,
      project: { ...snapshot.project, id: 'another-project' },
    })
  ).toBe(false);
  expect(session.snapshot).toEqual(snapshot);
});

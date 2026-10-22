import { participationMethods } from 'api/phases/types';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { createDraftPhase, UNSAVED_PHASE_ID } from './draftPhase';
import { createPreviewFetch } from './runtime';
import { PreviewSession } from './session';

it.each(participationMethods)(
  'previews an unsaved %s phase without real participation',
  async (method) => {
    const phase = createDraftPhase(project1.id, {
      participation_method: method,
      title_multiloc: { en: 'Unsaved title' },
      start_at: '2026-11-01',
      end_at: '2026-11-15',
    });
    const session = new PreviewSession({
      project: project1,
      phase,
      draft: {},
      unsaved: true,
    });
    const network = jest.fn();
    const fetch = createPreviewFetch(
      session,
      network,
      'https://example.com',
      jest.fn()
    );

    const shown = await (
      await fetch(`https://example.com/web_api/v1/phases/${UNSAVED_PHASE_ID}`)
    ).json();
    expect(shown.data.attributes.title_multiloc.en).toBe('Unsaved title');
    expect(shown.data.attributes.start_at).toBe('2026-11-01');
    expect(shown.data.attributes.end_at).toBe('2026-11-15');
    expect(shown.data.attributes.participation_method).toBe(method);

    const response = await fetch(
      `https://example.com/web_api/v1/phases/${UNSAVED_PHASE_ID}/inputs`,
      {
        method: 'POST',
        body: JSON.stringify({
          idea: { title_multiloc: { en: 'Do not submit' } },
        }),
      }
    );
    expect(response.status).toBe(422);
    expect(network).not.toHaveBeenCalled();
  }
);

it('keeps absent dates empty and adds the virtual phase only to its own project timeline', () => {
  const phase = createDraftPhase(project1.id, {});
  const session = new PreviewSession({
    project: project1,
    phase,
    draft: {},
    unsaved: true,
  });

  expect(phase.attributes.start_at).toBe('');
  expect(phase.attributes.end_at).toBeNull();
  expect(
    session.transform({ data: [] }, `/projects/${project1.id}/phases`)
  ).toMatchObject({ data: [{ id: UNSAVED_PHASE_ID }] });
  expect(session.transform({ data: [] }, '/projects/other/phases')).toEqual({
    data: [],
  });
  expect(
    session.transform(
      { data: [] },
      `/projects/${project1.id}/phases?placement_type=standalone`
    )
  ).toEqual({ data: [] });
  expect(session.read(`/phases/${UNSAVED_PHASE_ID}/permissions`)).toMatchObject(
    { data: [] }
  );
});

it('updates unsaved visual fields without changing its temporary identity', () => {
  const phase = createDraftPhase(project1.id, {});
  const session = new PreviewSession({
    project: project1,
    phase,
    draft: {},
    unsaved: true,
  });
  const updated = createDraftPhase(project1.id, {
    title_multiloc: { en: 'Edited' },
    voting_max_total: 12,
  });

  session.updateSnapshot({
    project: project1,
    phase: updated,
    draft: {},
    unsaved: true,
  });
  expect(session.read(`/phases/${UNSAVED_PHASE_ID}`)).toMatchObject({
    data: {
      id: UNSAVED_PHASE_ID,
      attributes: { title_multiloc: { en: 'Edited' }, voting_max_total: 12 },
    },
  });
});

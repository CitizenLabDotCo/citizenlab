import { CreateEventArguments } from 'api/ai_assistant_tool_calls/tools/createEvent';
import { CreatePhaseArguments } from 'api/ai_assistant_tool_calls/tools/createPhase';
import { DestroyResourceArguments } from 'api/ai_assistant_tool_calls/tools/destroyResource';
import { UpdatePhaseArguments } from 'api/ai_assistant_tool_calls/tools/updatePhase';
import { UpdatePhasePermissionArguments } from 'api/ai_assistant_tool_calls/tools/updatePhasePermission';
import { UpdateProjectArguments } from 'api/ai_assistant_tool_calls/tools/updateProject';
import { UpdateResourceArguments } from 'api/ai_assistant_tool_calls/tools/updateResource';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';
import { IEventData } from 'api/events/types';
import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData } from 'api/phases/types';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  getDraftEvents,
  getDraftPhases,
  getDraftProject,
  getProposedChanges,
} from './draft';

const call = (id: string) => ({ id, type: 'ai_assistant_tool_call' } as const);

const metadata = {
  status: 'awaiting_user',
  reason: null,
  decided_at: null,
  created_at: '2026-10-15T10:00:00Z',
} as const;

const updateProject = (
  args: UpdateProjectArguments
): IAiAssistantToolCallData => ({
  ...call('call-1'),
  attributes: { name: 'update_project', arguments: args, ...metadata },
});

const askUser: IAiAssistantToolCallData = {
  ...call('call-2'),
  attributes: {
    name: 'ask_user',
    arguments: { questions: [] },
    ...metadata,
  },
};

const createPhase = (args: CreatePhaseArguments): IAiAssistantToolCallData => ({
  ...call('create-phase'),
  attributes: { name: 'create_phase', arguments: args, ...metadata },
});

const updatePhase = (args: UpdatePhaseArguments): IAiAssistantToolCallData => ({
  ...call('update-phase'),
  attributes: { name: 'update_phase', arguments: args, ...metadata },
});

const updatePhasePermission = (
  args: UpdatePhasePermissionArguments
): IAiAssistantToolCallData => ({
  ...call('update-permission'),
  attributes: { name: 'update_phase_permission', arguments: args, ...metadata },
});

const destroyResource = (
  args: DestroyResourceArguments
): IAiAssistantToolCallData => ({
  ...call('destroy-resource'),
  attributes: { name: 'destroy_resource', arguments: args, ...metadata },
});

const createEvent = (args: CreateEventArguments): IAiAssistantToolCallData => ({
  ...call('create-event'),
  attributes: { name: 'create_event', arguments: args, ...metadata },
});

const updateResource = (
  args: UpdateResourceArguments
): IAiAssistantToolCallData => ({
  ...call('update-resource'),
  attributes: { name: 'update_resource', arguments: args, ...metadata },
});

const phase = (id: string, startAt: string, endAt: string): IPhaseData => ({
  ...phasesData[0],
  id,
  attributes: {
    ...phasesData[0].attributes,
    title_multiloc: { en: `Phase ${id}` },
    start_at: startAt,
    end_at: endAt,
  },
});

const event: IEventData = {
  id: 'event-1',
  type: 'event',
  attributes: {
    title_multiloc: { en: 'Walk along the street' },
    description_multiloc: {},
    location_multiloc: {},
    address_2_multiloc: {},
    address_1: 'Town hall',
    location_point_geojson: null,
    start_at: '2026-11-05T17:00:00Z',
    end_at: '2026-11-05T19:00:00Z',
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-15T10:00:00Z',
    attendees_count: 0,
    maximum_attendees: null,
  },
  relationships: {
    project: { data: { id: project1.id, type: 'project' } },
    event_images: { data: [] },
    user_attendance: { data: { id: '', type: 'event_attendance' } },
  },
};

describe('getDraftProject', () => {
  it('applies the proposed settings and lists what they change', () => {
    const draft = getDraftProject(project1, [
      updateProject({
        title_multiloc: { en: 'Reimagining Mercier Street' },
        listed: false,
      }),
    ]);

    expect(draft.title).toEqual({
      ...project1.attributes.title_multiloc,
      en: 'Reimagining Mercier Street',
    });
    expect(draft.listed).toBe(false);
    expect(draft.changed).toEqual(['title_multiloc', 'listed']);
    expect(draft.change?.kind).toBe('update');
    expect(draft.previous?.title).toEqual(project1.attributes.title_multiloc);
    expect(draft.previous?.listed).toBe(project1.attributes.listed);
  });

  it('shows the saved project without a proposed change', () => {
    const draft = getDraftProject(project1, []);

    expect(draft.title).toEqual(project1.attributes.title_multiloc);
    expect(draft.changed).toEqual([]);
    expect(draft.change).toBeUndefined();
  });
});

describe('getDraftPhases', () => {
  const saved = [
    phase('phase-2', '2026-11-21', '2026-12-11'),
    phase('phase-1', '2026-10-22', '2026-11-20'),
  ];

  it('adds the proposed phase in date order', () => {
    const phases = getDraftPhases(saved, [
      createPhase({
        title_multiloc: { en: 'Share the results' },
        participation_method: 'information',
        start_at: '2026-12-12',
      }),
    ]);

    expect(phases.map(({ key }) => key)).toEqual([
      'phase-1',
      'phase-2',
      'create-phase',
    ]);
    expect(phases[2]).toMatchObject({
      method: 'information',
      endAt: null,
      change: { kind: 'create' },
    });
  });

  it('applies changes, removals and access rights to the right phase', () => {
    const phases = getDraftPhases(saved, [
      updatePhase({ phase_id: 'phase-1', end_at: '2026-11-25' }),
      destroyResource({ resource_type: 'phase', id: 'phase-2' }),
      updatePhasePermission({
        phase_id: 'phase-1',
        action: 'posting_idea',
        permitted_by: 'everyone',
      }),
    ]);

    expect(phases[0]).toMatchObject({
      endAt: '2026-11-25',
      changed: ['end_at'],
      change: { kind: 'update' },
    });
    expect(phases[0].permissionChange?.toolCall.id).toBe('update-permission');
    expect(phases[1].change?.kind).toBe('remove');
    expect(phases[1].permissionChange).toBeUndefined();
  });

  it('keeps a removal for last, because approving it removes the row', () => {
    const removal = destroyResource({ resource_type: 'phase', id: 'phase-1' });
    const update = updatePhase({ phase_id: 'phase-1', end_at: '2026-11-25' });
    const permissionUpdate = updatePhasePermission({
      phase_id: 'phase-1',
      action: 'posting_idea',
      permitted_by: 'everyone',
    });

    const decisionOf = (proposedChanges: IAiAssistantToolCallData[]) => {
      const [{ change, permissionChange }] = getDraftPhases(
        saved,
        proposedChanges
      );
      return (change ?? permissionChange)?.toolCall.id;
    };

    expect(decisionOf([removal, update])).toBe('update-phase');
    expect(decisionOf([removal, permissionUpdate])).toBe('update-permission');
    expect(decisionOf([removal])).toBe('destroy-resource');
  });

  it('removes the end date with an explicit null', () => {
    const phases = getDraftPhases(saved, [
      updatePhase({ phase_id: 'phase-1', end_at: null }),
    ]);

    expect(phases[0].endAt).toBeNull();
  });

  it('keeps the saved version of an updated phase to compare with', () => {
    const phases = getDraftPhases(saved, [
      updatePhase({ phase_id: 'phase-1', end_at: '2026-11-25' }),
      createPhase({ title_multiloc: {}, start_at: '2026-12-12' }),
    ]);

    expect(phases[0].previous).toMatchObject({
      endAt: '2026-11-20',
      changed: [],
    });
    expect(phases[1].previous).toBeUndefined();
    expect(phases[2].previous).toBeUndefined();
  });
});

describe('getDraftEvents', () => {
  it('adds the proposed event in date order', () => {
    const events = getDraftEvents(
      [event],
      [
        createEvent({
          title_multiloc: { en: 'Workshop' },
          start_at: '2026-10-30T17:00:00Z',
          end_at: '2026-10-30T19:00:00Z',
        }),
      ]
    );

    expect(events.map(({ key }) => key)).toEqual(['create-event', 'event-1']);
    expect(events[0].change?.kind).toBe('create');
  });

  it('applies the proposed change to an event', () => {
    const [draft] = getDraftEvents(
      [event],
      [
        updateResource({
          type: 'event',
          id: 'event-1',
          attributes: { address_1: 'Community centre' },
        }),
      ]
    );

    expect(draft).toMatchObject({
      address: 'Community centre',
      changed: ['address_1'],
      change: { kind: 'update' },
      previous: { address: 'Town hall' },
    });
  });

  it('clears a saved address with an explicit null', () => {
    const [draft] = getDraftEvents(
      [event],
      [
        updateResource({
          type: 'event',
          id: 'event-1',
          attributes: { address_1: null },
        }),
      ]
    );

    expect(draft.address).toBeNull();
    expect(draft.previous?.address).toBe('Town hall');
  });

  it('marks a proposed removal, after any other change to the event', () => {
    const removal = destroyResource({ resource_type: 'event', id: 'event-1' });
    const update = updateResource({
      type: 'event',
      id: 'event-1',
      attributes: { address_1: 'Community centre' },
    });

    expect(getDraftEvents([event], [removal])[0].change?.kind).toBe('remove');
    expect(getDraftEvents([event], [removal, update])[0].change?.kind).toBe(
      'update'
    );
  });
});

describe('getProposedChanges', () => {
  it('leaves out the questions, which are answered in the chat', () => {
    const proposedChanges = getProposedChanges([askUser, updateProject({})]);

    expect(proposedChanges.map(({ id }) => id)).toEqual(['call-1']);
  });
});

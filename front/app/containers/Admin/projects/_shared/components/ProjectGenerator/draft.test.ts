import { UpdateProjectArguments } from 'api/ai_assistant_tool_calls/tools/updateProject';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { getDraftProject, getProposedChanges } from './draft';

const metadata = {
  status: 'awaiting_user',
  reason: null,
  decided_at: null,
  created_at: '2026-10-15T10:00:00Z',
} as const;

const updateProject = (
  args: UpdateProjectArguments
): IAiAssistantToolCallData => ({
  id: 'call-1',
  type: 'ai_assistant_tool_call',
  attributes: { name: 'update_project', arguments: args, ...metadata },
});

const askUser: IAiAssistantToolCallData = {
  id: 'call-2',
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'ask_user',
    arguments: { questions: [] },
    ...metadata,
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

describe('getProposedChanges', () => {
  it('leaves out the questions, which are answered in the chat', () => {
    const proposedChanges = getProposedChanges([askUser, updateProject({})]);

    expect(proposedChanges.map(({ id }) => id)).toEqual(['call-1']);
  });
});

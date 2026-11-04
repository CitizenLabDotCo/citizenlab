import { fillParams, mergeFixture, ROUTE_PARAMS } from './routes-fixture';

const api: Record<string, any> = {
  '/ideas?page[size]=1': {
    data: [
      {
        id: 'idea1',
        attributes: { slug: 'an-idea' },
        relationships: {
          project: { data: { id: 'p1' } },
          phases: { data: [{ id: 'ph2' }] },
          author: { data: { id: 'u1' } },
        },
      },
    ],
  },
  '/projects/p1': { data: { id: 'p1', attributes: { slug: 'a-project' } } },
  '/projects/p1/phases': { data: [{ id: 'ph1' }, { id: 'ph2' }] },
  '/project_folders?page[size]=1': {
    data: [{ id: 'f1', attributes: { slug: 'a-folder' } }],
  },
};

describe('routes fixture', () => {
  it('fills what the public API returns and keeps nested ids together', async () => {
    const { params, paths } = await fillParams(async (p) => api[p]);
    expect(params).toEqual({
      ideaId: 'idea1',
      userId: 'u1',
      projectId: 'p1',
      slug: 'a-project',
      phaseId: 'ph2',
      phaseNumber: '2',
      folderId: 'f1',
      projectFolderId: 'f1',
    });
    expect(paths).toEqual({
      'ideas/$slug': { slug: 'an-idea' },
      'folders/$slug': { slug: 'a-folder' },
    });
  });

  it('keeps hand-filled values, hosts and locale, and lists what is missing', () => {
    const merged = mergeFixture(
      {
        hosts: { after: 'https://x', before: '' },
        params: { groupId: 'g1', projectId: 'old' },
        locale: 'nl-BE',
      },
      { params: { projectId: 'p1' }, paths: {} },
      'https://host',
      new Date('2026-10-23T00:00:00Z')
    );
    expect(merged.hosts).toEqual({ after: 'https://x', before: '' });
    expect(merged.locale).toBe('nl-BE');
    expect(merged.params).toEqual({ groupId: 'g1', projectId: 'p1' });
    expect(merged.missing).toEqual(
      ROUTE_PARAMS.filter((p) => p !== 'groupId' && p !== 'projectId')
    );
    expect(merged.source).toEqual({
      host: 'https://host',
      fetchedAt: '2026-10-23T00:00:00.000Z',
    });
  });
});

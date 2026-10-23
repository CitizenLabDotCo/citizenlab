import { loadAudit, missing } from './data';

// The workbench resolves @ds through its Vite alias; jest does not.
jest.mock('@ds/tokens/tokens.meta.json', () => [], { virtual: true });

const files: Record<string, unknown> = {
  '../audits/index.json': {
    components: {
      OptionList: { file: 'audits/OptionList.json' },
      Evil: { file: '../../secrets.json' },
    },
  },
  '../audits/OptionList.json': {
    component: 'OptionList',
    generatedAt: '2026-10-23T00:00:00.000Z',
    host: 'https://host',
    instances: [{ route: 'admin/a', viewport: 'desktop' }],
    notReached: [],
    inconsistencies: [],
    healTasks: [],
  },
};

beforeAll(() => {
  global.fetch = jest.fn((url: string) =>
    Promise.resolve({
      ok: url in files,
      status: url in files ? 200 : 404,
      json: () => Promise.resolve(files[url]),
    })
  ) as unknown as typeof fetch;
});

describe('loadAudit', () => {
  it('loads the committed audit of a component through the index', async () => {
    expect((await loadAudit('OptionList'))?.instances).toHaveLength(1);
  });

  it('is null without an audit or for a path outside audits/', async () => {
    expect(await loadAudit('Button')).toBeNull();
    expect(await loadAudit('Evil')).toBeNull();
    expect(global.fetch).not.toHaveBeenCalledWith('../../../secrets.json');
  });

  it('never lists audits as missing', () => {
    expect(missing).toEqual([]);
  });
});

import * as library from '../../../../app/component-library/utils/gvInstance';
import * as bridge from '../../../instanceEvents';

import type { ScanOutput } from './data';
import {
  callSitesOf,
  changeLine,
  decodeInstanceEdits,
  editKey,
  editStatus,
  framePayload,
  INSTANCE_ATTR,
  InstanceEdit,
  instanceCount,
  instanceKey,
  instanceTask,
  InstanceReport,
  jsxProp,
  MAX_EDITS,
  parseStoredEdits,
  payloadOfHash,
  propSpecs,
  putEdit,
  REPORT_EVENT,
  SET_EVENT,
  specError,
  verdictOf,
  withInstanceEdits,
} from './instanceProps';
import type { ArgType } from './preview';

const SPOT = 'homepagebuilder-spotlight--standard';
const edit = (over: Partial<InstanceEdit> = {}): InstanceEdit => ({
  storyId: SPOT,
  component: 'Button',
  index: 0,
  prop: 'buttonStyle',
  value: 'text',
  from: 'primary',
  ...over,
});

// The shape Storybook's docgen gives Button's props.
const BUTTON_ARGTYPES: Record<string, ArgType> = {
  buttonStyle: {
    control: { type: 'select' },
    options: ['primary', 'text', 'secondary'],
    type: { name: 'enum', value: ['primary', 'text', 'secondary'] },
  },
  size: { control: { type: 'radio' }, options: ['s', 'm', 'l', 'xl'] },
  fullWidth: { control: { type: 'boolean' }, type: { name: 'boolean' } },
  processing: { control: { type: 'boolean' }, type: { name: 'boolean' } },
  text: { control: { type: 'text' }, type: { name: 'string' } },
  onClick: { type: { name: 'function' } },
  children: { control: { type: 'text' } },
  icon: { type: { name: 'other' } },
};

describe('the wire names', () => {
  it('match the library hook and the preview bridge', () => {
    expect(INSTANCE_ATTR).toBe(library.INSTANCE_ATTR);
    expect(SET_EVENT).toBe(bridge.SET_EVENT);
    expect(REPORT_EVENT).toBe(bridge.REPORT_EVENT);
  });
});

describe('identity', () => {
  it('keys an instance by story, component and place', () => {
    expect(instanceKey(edit())).toBe(`${SPOT}|Button|0`);
    expect(editKey(edit({ index: 2 }))).toBe(`${SPOT}|Button|2|buttonStyle`);
  });
});

describe('propSpecs', () => {
  it('takes enums and booleans the component declares, from its argTypes', () => {
    expect(
      propSpecs(BUTTON_ARGTYPES, [
        'buttonStyle',
        'size',
        'fullWidth',
        'iconPos',
        'text',
        'onClick',
        'children',
        'icon',
      ])
    ).toEqual([
      {
        name: 'buttonStyle',
        kind: 'enum',
        options: ['primary', 'text', 'secondary'],
      },
      { name: 'size', kind: 'enum', options: ['s', 'm', 'l', 'xl'] },
      { name: 'fullWidth', kind: 'boolean' },
    ]);
  });

  it('offers nothing the component does not declare', () => {
    expect(propSpecs(BUTTON_ARGTYPES, [])).toEqual([]);
  });
});

describe('checks', () => {
  const specs = {
    Button: propSpecs(BUTTON_ARGTYPES, ['buttonStyle', 'fullWidth']),
  };

  it('allows an option of the argTypes, a boolean for a toggle', () => {
    expect(verdictOf(edit(), specs)).toBe('ok');
    expect(verdictOf(edit({ prop: 'fullWidth', value: true }), specs)).toBe(
      'ok'
    );
  });

  it('refuses a value or a prop the argTypes do not have', () => {
    expect(verdictOf(edit({ value: 'neon' }), specs)).toBe('bad');
    expect(verdictOf(edit({ prop: 'size', value: 's' }), specs)).toBe('bad');
    expect(verdictOf(edit({ prop: 'fullWidth', value: 'yes' }), specs)).toBe(
      'bad'
    );
    expect(specError(undefined, 'x')).toBe('not an instance property');
  });

  it('waits for argTypes it does not have yet', () => {
    expect(verdictOf(edit({ component: 'Title' }), specs)).toBe('unknown');
  });
});

describe('share link', () => {
  it('round-trips through the hash and keeps the token link', () => {
    const edits = [edit(), edit({ prop: 'fullWidth', value: true })];
    const hash = withInstanceEdits(`#/patterns/${SPOT}?o=abc`, edits);
    expect(hash).toMatch(
      /^#\/patterns\/homepagebuilder-spotlight--standard\?o=abc&p=/
    );
    const back = decodeInstanceEdits(payloadOfHash(hash) as string);
    expect(back.error).toBeUndefined();
    // The link carries no `from`: the instance reports it.
    expect(back.edits).toEqual(edits.map(({ from: _f, ...e }) => e));
    expect(withInstanceEdits(hash, [])).toBe(`#/patterns/${SPOT}?o=abc`);
  });

  const payload = (tuples: unknown) =>
    btoa(JSON.stringify(tuples))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  it.each([
    ['not base64', '%%%', 'the link is damaged'],
    ['not JSON', payload('x').slice(2), 'the link is damaged'],
    ['an object', payload({ a: 1 }), 'the link is damaged'],
    [
      'a short tuple',
      payload([[SPOT, 'Button', 0, 'buttonStyle']]),
      'the link is damaged',
    ],
    [
      'a bad story',
      payload([['../x', 'Button', 0, 'buttonStyle', 'text']]),
      'an entry names no valid story',
    ],
    [
      'a lowercase component',
      payload([[SPOT, 'button', 0, 'buttonStyle', 'text']]),
      'an entry names no valid component',
    ],
    [
      'a negative index',
      payload([[SPOT, 'Button', -1, 'buttonStyle', 'text']]),
      'an entry has no valid instance number',
    ],
    [
      'a fractional index',
      payload([[SPOT, 'Button', 0.5, 'buttonStyle', 'text']]),
      'an entry has no valid instance number',
    ],
    [
      'a prop with symbols',
      payload([[SPOT, 'Button', 0, 'on-click', 'x']]),
      'an entry names no valid prop',
    ],
    [
      'markup',
      payload([[SPOT, 'Button', 0, 'buttonStyle', '<img>']]),
      'buttonStyle has a value that is not allowed',
    ],
    [
      'an object value',
      payload([[SPOT, 'Button', 0, 'buttonStyle', { a: 1 }]]),
      'buttonStyle has a value that is not allowed',
    ],
    [
      'a long value',
      payload([[SPOT, 'Button', 0, 'buttonStyle', 'a'.repeat(65)]]),
      'buttonStyle has a value that is not allowed',
    ],
    [
      'a repeat',
      payload([
        [SPOT, 'Button', 0, 'buttonStyle', 'text'],
        [SPOT, 'Button', 0, 'buttonStyle', 'white'],
      ]),
      'the link repeats a prop edit',
    ],
  ])('rejects the whole link for %s', (_label, p, error) => {
    expect(decodeInstanceEdits(p as string)).toEqual({ edits: [], error });
  });

  it('caps the number of edits and the length', () => {
    const many = Array.from({ length: MAX_EDITS + 1 }, (_, i) => [
      SPOT,
      'Button',
      i,
      'buttonStyle',
      'text',
    ]);
    expect(decodeInstanceEdits(payload(many)).error).toBe(
      'the link has too many prop edits'
    );
    expect(decodeInstanceEdits('a'.repeat(5000)).error).toBe(
      'the link is too long'
    );
  });
});

describe('stored edits', () => {
  it('keeps the good entries and drops the rest', () => {
    const raw = JSON.stringify([
      edit(),
      { ...edit({ index: 1 }), value: '<b>' },
      { ...edit({ index: 2 }), extra: 'dropped' },
      edit(),
      'junk',
    ]);
    expect(parseStoredEdits(raw)).toEqual([edit(), edit({ index: 2 })]);
    expect(parseStoredEdits('{')).toEqual([]);
    expect(parseStoredEdits(null)).toEqual([]);
  });
});

describe('framePayload and putEdit', () => {
  it('groups the edits per story and instance', () => {
    expect(
      framePayload([
        edit(),
        edit({ prop: 'fullWidth', value: true }),
        edit({
          storyId: 'x--y',
          component: 'Title',
          prop: 'variant',
          value: 'h2',
        }),
      ])
    ).toEqual({
      [SPOT]: { 'Button#0': { buttonStyle: 'text', fullWidth: true } },
      'x--y': { 'Title#0': { variant: 'h2' } },
    });
  });

  it('takes a story id such as `constructor` as a plain key', () => {
    const out = framePayload([edit({ storyId: 'constructor' })]);
    expect(Object.getPrototypeOf(out)).toBeNull();
    expect(out.constructor).toEqual({ 'Button#0': { buttonStyle: 'text' } });
  });

  it('replaces an edit, keeps its first `from`, drops it back at the start', () => {
    let list = putEdit([], edit());
    list = putEdit(list, edit({ value: 'secondary', from: 'text' }));
    expect(list).toEqual([edit({ value: 'secondary', from: 'primary' })]);
    expect(putEdit(list, edit({ value: 'primary' }))).toEqual([]);
  });
});

describe('editStatus', () => {
  const specs = { Button: propSpecs(BUTTON_ARGTYPES, ['buttonStyle']) };
  const instance = (over: Partial<InstanceReport> = {}): InstanceReport => ({
    uid: 'u1',
    name: 'Button',
    index: 0,
    props: { buttonStyle: 'primary' },
    base: { buttonStyle: 'primary' },
    set: ['buttonStyle'],
    overridden: ['buttonStyle'],
    ...over,
  });
  const report = (instances: InstanceReport[]) => ({
    storyId: SPOT,
    instances,
  });

  it('is ok when the instance still renders what the edit started from', () => {
    expect(editStatus(edit(), specs, report([instance()]))).toBe('ok');
    // Another story on screen: nothing to compare with.
    expect(editStatus(edit(), specs, { storyId: 'x--y', instances: [] })).toBe(
      'ok'
    );
  });

  it('is stale when the base moved on or the instance is gone', () => {
    expect(
      editStatus(
        edit(),
        specs,
        report([instance({ base: { buttonStyle: 'secondary' } })])
      )
    ).toBe('stale');
    expect(editStatus(edit(), specs, report([]))).toBe('stale');
    expect(editStatus(edit({ index: 1 }), specs, report([instance()]))).toBe(
      'stale'
    );
  });

  it('is unchecked without the argTypes or with a refused value', () => {
    expect(editStatus(edit(), {}, null)).toBe('unchecked');
    expect(editStatus(edit({ value: 'neon' }), specs, null)).toBe('unchecked');
  });

  it('counts the instances of the story on screen', () => {
    const r = report([instance(), instance({ uid: 'u2', index: 1 })]);
    expect(instanceCount(r, SPOT, 'Button')).toBe(2);
    expect(instanceCount(r, 'x--y', 'Button')).toBeUndefined();
  });
});

describe('words', () => {
  it('says what changes in the Changes drawer', () => {
    expect(changeLine(edit(), 'Spotlight')).toBe(
      'Spotlight › Button: buttonStyle primary → text'
    );
    expect(changeLine(edit({ index: 1, from: undefined }), 'Spotlight')).toBe(
      'Spotlight › Button 2: buttonStyle not set → text'
    );
  });

  it('writes the prop as JSX', () => {
    expect(jsxProp('buttonStyle', 'text')).toBe('buttonStyle="text"');
    expect(jsxProp('fullWidth', true)).toBe('fullWidth');
    expect(jsxProp('fullWidth', false)).toBe('fullWidth={false}');
    expect(jsxProp('level', 2)).toBe('level={2}');
  });
});

const SPOTLIGHT =
  'app/components/admin/ContentBuilder/Widgets/Spotlight/Spotlight.tsx';
const WRAPPER = 'app/components/UI/ButtonWithLink/index.tsx';
const scan = {
  components: [
    { component: 'ButtonWithLink', file: WRAPPER },
    {
      component: 'Button',
      file: 'app/component-library/components/Button/index.tsx',
    },
    {
      component: 'Title',
      file: 'app/component-library/components/Title/index.tsx',
    },
  ],
  usages: [
    { component: 'Button', file: WRAPPER, line: 3, props: ['as'], sites: [98] },
    {
      component: 'ButtonWithLink',
      file: SPOTLIGHT,
      line: 26,
      props: ['linkTo', 'w'],
      sites: [93],
    },
    {
      component: 'Title',
      file: SPOTLIGHT,
      line: 3,
      props: ['color', 'mt'],
      sites: [81],
    },
    { component: 'Box', file: SPOTLIGHT, line: 3, props: [], sites: [61, 70] },
  ],
} as unknown as ScanOutput;

describe('callSitesOf', () => {
  it('finds the component itself and wrappers that render it', () => {
    expect(callSitesOf(scan, SPOTLIGHT, 'Title')).toEqual([
      { line: 81, element: 'Title' },
    ]);
    expect(callSitesOf(scan, SPOTLIGHT, 'Button')).toEqual([
      { line: 93, element: 'ButtonWithLink', wrapperFile: WRAPPER },
    ]);
    expect(callSitesOf(scan, SPOTLIGHT, 'Image')).toEqual([]);
  });

  it('reads a scan from before sites as no sites', () => {
    const old = {
      ...scan,
      usages: scan.usages.map(({ sites: _s, ...u }) => u),
    } as unknown as ScanOutput;
    expect(callSitesOf(old, SPOTLIGHT, 'Title')).toEqual([]);
  });
});

describe('instanceTask', () => {
  it('names the parent file, the line and the wrapper', () => {
    expect(
      instanceTask(edit(), {
        storyName: 'Spotlight',
        parentFile: SPOTLIGHT,
        sites: callSitesOf(scan, SPOTLIGHT, 'Button'),
      })
    ).toBe(
      [
        `change: Spotlight · ${SPOTLIGHT}:93 · on the ButtonWithLink at line 93, set buttonStyle="text"`,
        `note: the call site is ButtonWithLink, a wrapper (${WRAPPER}) that renders Button; check that it passes buttonStyle through to Button`,
        'why: instance prop from the workbench: buttonStyle primary → text on this Button inside Spotlight, not on every Button; it changes every Spotlight wherever it renders',
        `check: story ${SPOT}`,
      ].join('\n')
    );
  });

  it('names a direct call site without a note', () => {
    const text = instanceTask(
      edit({ component: 'Title', prop: 'variant', value: 'h2', from: 'h1' }),
      {
        storyName: 'Spotlight',
        parentFile: SPOTLIGHT,
        sites: callSitesOf(scan, SPOTLIGHT, 'Title'),
      }
    );
    expect(text.split('\n')[0]).toBe(
      `change: Spotlight · ${SPOTLIGHT}:81 · on the Title at line 81, set variant="h2"`
    );
    expect(text).not.toContain('note:');
  });

  it('lists the candidates when there are several, and says when there are none', () => {
    const two = instanceTask(edit({ index: 1 }), {
      storyName: 'Spotlight',
      parentFile: SPOTLIGHT,
      sites: [
        { line: 10, element: 'Button' },
        { line: 20, element: 'ButtonWithLink', wrapperFile: WRAPPER },
      ],
    });
    expect(two.split('\n')[0]).toBe(
      `change: Spotlight · ${SPOTLIGHT} · set buttonStyle="text" on the call site that renders this Button (the 2nd Button in the story), one of: line 10 (Button), line 20 (ButtonWithLink, a wrapper)`
    );
    const none = instanceTask(edit(), {
      storyName: 'Spotlight',
      parentFile: SPOTLIGHT,
      sites: [],
    });
    expect(none.split('\n')[0]).toContain('the scan found no call site');
  });

  it('keeps the place in the story when instances outnumber call sites', () => {
    const text = instanceTask(edit(), {
      storyName: 'Spotlight',
      parentFile: SPOTLIGHT,
      sites: [{ line: 10, element: 'Button' }],
      instances: 3,
    });
    expect(text.split('\n')[0]).toBe(
      `change: Spotlight · ${SPOTLIGHT}:10 · on the Button at line 10 (the 1st Button in the story), set buttonStyle="text"`
    );
    expect(text).toContain(
      'note: the story renders 3 Button and the scan found 1 call site in this file; this one may come from a loop or from a child component'
    );
    const second = instanceTask(edit({ index: 1 }), {
      storyName: 'Spotlight',
      parentFile: SPOTLIGHT,
      sites: [{ line: 10, element: 'Button' }],
    });
    expect(second.split('\n')[0]).toContain('(the 2nd Button in the story)');
    expect(second).not.toContain('child component');
  });
});

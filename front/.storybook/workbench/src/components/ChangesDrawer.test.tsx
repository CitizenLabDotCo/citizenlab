import '../testing/reactGlobal';

import { fireEvent, render, screen } from '@testing-library/react';

import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';
import { copyText } from '../lib/clipboard';
import type { TokenMeta } from '../lib/data';
import type { ElementEdit } from '../lib/elementEdits';
import type { InstanceEdit } from '../lib/instanceProps';

import ChangesDrawer, { InstanceChange } from './ChangesDrawer';

jest.mock('../lib/clipboard', () => ({ copyText: jest.fn(async () => true) }));
// Jest has no @ds alias (the shell's Vite and tsconfig do).
jest.mock(
  '@ds/tokens/tokens.source.json',
  () =>
    jest.requireActual(
      '../../../../app/design-system/tokens/tokens.source.json'
    ),
  { virtual: true }
);

const meta = tokensMeta as TokenMeta[];
const edit: ElementEdit = {
  id: 's|0|fill',
  storyId: 's',
  path: [0],
  rowId: 'fill',
  label: 'Fill',
  glyph: 'fill',
  props: ['background-color'],
  from: { raw: 'rgb(96, 69, 150)', shown: '604596' },
  to: { value: '#604596', token: '--gv-tenant-primary' },
  kind: 'attach',
  at: 1,
};

describe('ChangesDrawer with element edits', () => {
  it('lists the edit, copies its task and resets it', async () => {
    const onResetElement = jest.fn();
    const onResetElements = jest.fn();
    const onReset = jest.fn();
    render(
      <ChangesDrawer
        meta={meta}
        mode="today"
        overrides={{}}
        onReset={onReset}
        onClose={() => undefined}
        elements={[edit]}
        onResetElement={onResetElement}
        onResetElements={onResetElements}
        resolve={() => '#604596'}
        task={{
          component: 'Button',
          file: 'b.tsx',
          storyId: 's',
          routes: [],
          mode: 'both',
          layer: 'button',
          findings: [],
        }}
      />
    );
    const row = screen.getByTestId('wb-change-row');
    expect(row.getAttribute('data-kind')).toBe('attach');
    expect(row.textContent).toContain('tenant-primary');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain(
      '1'
    );
    // Token-only actions stay away without token edits.
    expect(screen.queryByTestId('wb-copy-diff')).toBeNull();
    fireEvent.click(screen.getByTestId('wb-copy-agent'));
    await Promise.resolve();
    expect((copyText as jest.Mock).mock.calls[0][0]).toContain(
      '→ --gv-tenant-primary · mode both'
    );
    fireEvent.click(row.querySelector('button') as HTMLButtonElement);
    expect(onResetElement).toHaveBeenCalledWith('s|0|fill');
    fireEvent.click(screen.getByText('Reset all'));
    expect(onReset).toHaveBeenCalled();
    expect(onResetElements).toHaveBeenCalled();
  });

  it('marks a change of look', () => {
    render(
      <ChangesDrawer
        meta={meta}
        mode="today"
        overrides={{}}
        onReset={() => undefined}
        onClose={() => undefined}
        elements={[{ ...edit, kind: 'custom', to: { value: '#ff0000' } }]}
        resolve={() => ''}
      />
    );
    expect(screen.getByLabelText("Changes today's look")).toBeTruthy();
  });
});

describe('ChangesDrawer with instance edits', () => {
  const change = (
    over: Partial<InstanceEdit>,
    status: InstanceChange['status']
  ): InstanceChange => {
    const e: InstanceEdit = {
      storyId: 's--a',
      component: 'Button',
      index: 0,
      prop: 'buttonStyle',
      value: 'text',
      from: 'primary',
      ...over,
    };
    return {
      edit: e,
      line: `line ${e.index}`,
      task: `task ${e.index}`,
      status,
    };
  };

  beforeEach(() => (copyText as jest.Mock).mockClear());

  it('copies only checked, current edits and says how many are left out', async () => {
    render(
      <ChangesDrawer
        meta={meta}
        mode="today"
        overrides={{}}
        onReset={() => undefined}
        onClose={() => undefined}
        instances={[
          change({ index: 0 }, 'ok'),
          change({ index: 1 }, 'stale'),
          change({ index: 2 }, 'unchecked'),
        ]}
        resolve={() => ''}
      />
    );
    const rows = screen.getAllByTestId('wb-change-row');
    expect(rows.map((r) => r.getAttribute('data-status'))).toEqual([
      'ok',
      'stale',
      'unchecked',
    ]);
    expect(rows[1].textContent).toContain('Out of date');
    expect(rows[2].textContent).toContain('Not checked');
    fireEvent.click(screen.getByTestId('wb-copy-agent'));
    await Promise.resolve();
    const text = (copyText as jest.Mock).mock.calls[0][0] as string;
    expect(text).toContain('task 0');
    expect(text).not.toContain('task 1');
    expect(text).not.toContain('task 2');
    expect(text).toContain('2 instance prop edits are left out');
  });

  it('offers no agent copy when no edit is ready', () => {
    render(
      <ChangesDrawer
        meta={meta}
        mode="today"
        overrides={{}}
        onReset={() => undefined}
        onClose={() => undefined}
        instances={[change({}, 'stale')]}
        resolve={() => ''}
      />
    );
    expect(screen.queryByTestId('wb-copy-agent')).toBeNull();
  });
});

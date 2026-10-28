import '../testing/reactGlobal';

import { fireEvent, render, screen } from '@testing-library/react';

import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';
import { copyText } from '../lib/clipboard';
import type { TokenMeta } from '../lib/data';
import type { ElementEdit } from '../lib/elementEdits';

import ChangesDrawer from './ChangesDrawer';

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
          layer: 'button',
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
      '→ --gv-tenant-primary'
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
        overrides={{}}
        onReset={() => undefined}
        onClose={() => undefined}
        elements={[{ ...edit, kind: 'custom', to: { value: '#ff0000' } }]}
        resolve={() => ''}
      />
    );
    expect(screen.getByLabelText('Changes the look')).toBeTruthy();
  });
});

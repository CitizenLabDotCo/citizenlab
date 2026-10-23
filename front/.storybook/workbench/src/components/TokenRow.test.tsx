import '../testing/reactGlobal';

import { fireEvent, render, screen } from '@testing-library/react';

import type { TokenMeta } from '../lib/data';

import TokenRow from './TokenRow';

jest.mock('../lib/tokenValues', () => {
  const defs = {
    '--gv-radius-2': '8px',
    '--gv-radius-control': 'var(--gv-radius-2)',
    '--gv-shadow-menu': '0px 0px 12px 0px rgba(0,0,0,0.18)',
  };
  return {
    DEFS: { today: defs, redesign: defs },
    BASE: { today: {}, redesign: {} },
  };
});

const token = (
  name: string,
  value: string,
  over: Partial<TokenMeta> = {}
): TokenMeta =>
  ({
    name,
    category: 'radius',
    tier: 2,
    type: 'dimension',
    values: { today: value, redesign: value },
    legacy: [],
    ...over,
  } as TokenMeta);

const META = [
  token('--gv-radius-2', '8px', { tier: 1 }),
  token('--gv-radius-control', '8px'),
  token('--gv-shadow-menu', '0px 0px 12px 0px rgba(0,0,0,0.18)', {
    category: 'shadow',
    type: 'shadow',
  }),
];

const live = (name: string, value: string) => ({
  today: { [name]: value },
  redesign: { [name]: value },
});

const table = (row: JSX.Element) =>
  render(
    <table>
      <tbody>{row}</tbody>
    </table>
  );

describe('TokenRow value field', () => {
  it('steps a length with the arrow keys, exactly and clamped at 0', () => {
    const onSet = jest.fn(() => undefined);
    table(
      <TokenRow
        token={META[0]}
        meta={META}
        mode="today"
        live={live('--gv-radius-2', '8px')}
        hasScan={false}
        onSet={onSet}
        onReset={jest.fn()}
      />
    );
    const input = screen.getByTestId('wb-token-input');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onSet).toHaveBeenLastCalledWith('--gv-radius-2', '9px');
    fireEvent.keyDown(input, { key: 'ArrowDown', shiftKey: true });
    expect(onSet).toHaveBeenLastCalledWith('--gv-radius-2', '0px');
  });

  it('shows the original and a reset when edited', () => {
    const onReset = jest.fn();
    table(
      <TokenRow
        token={META[0]}
        meta={META}
        mode="today"
        override="10px"
        live={live('--gv-radius-2', '10px')}
        hasScan={false}
        onSet={jest.fn()}
        onReset={onReset}
      />
    );
    expect(
      (screen.getByTestId('wb-token-input') as HTMLInputElement).value
    ).toBe('10px');
    expect(screen.getByTestId('wb-token-was').textContent).toBe('was 8px');
    fireEvent.click(screen.getByTestId('wb-token-reset'));
    expect(onReset).toHaveBeenCalledWith('--gv-radius-2');
  });

  it('draws an alias as a link to its source, and Detach gives a field', () => {
    table(
      <TokenRow
        token={META[1]}
        meta={META}
        mode="today"
        live={live('--gv-radius-control', '8px')}
        hasScan={false}
        onSet={jest.fn()}
        onReset={jest.fn()}
      />
    );
    expect(screen.queryByTestId('wb-token-input')).toBeNull();
    const link = screen.getByTestId('wb-token-alias').querySelector('a');
    expect(link?.getAttribute('href')).toBe(
      '#/foundations/radius/--gv-radius-2'
    );
    fireEvent.click(screen.getByTestId('wb-token-detach'));
    expect(screen.getByTestId('wb-token-input')).toBeTruthy();
  });

  it('opens the shadow layers and writes a field back as a box-shadow', () => {
    const onSet = jest.fn(() => undefined);
    table(
      <TokenRow
        token={META[2]}
        meta={META}
        mode="today"
        live={live('--gv-shadow-menu', META[2].values.today)}
        hasScan={false}
        onSet={onSet}
        onReset={jest.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('wb-shadow-toggle'));
    expect(screen.getByText('Drop shadow')).toBeTruthy();
    fireEvent.keyDown(screen.getByLabelText('Blur'), { key: 'ArrowUp' });
    expect(onSet).toHaveBeenLastCalledWith(
      '--gv-shadow-menu',
      '0 0 13px 0 rgba(0,0,0,0.18)'
    );
    fireEvent.change(screen.getByLabelText('Opacity'), {
      target: { value: '50' },
    });
    expect(onSet).toHaveBeenLastCalledWith(
      '--gv-shadow-menu',
      '0 0 12px 0 rgba(0,0,0,0.5)'
    );
  });
});

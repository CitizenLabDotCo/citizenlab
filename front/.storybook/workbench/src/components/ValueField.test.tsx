import '../testing/reactGlobal';

import { fireEvent, render, screen } from '@testing-library/react';

import type { InspectRow } from '../lib/inspect';
import { rowSpec } from '../lib/inspect';

import { ValueField } from './ValueField';

const row = (
  over: Partial<InspectRow['value']>,
  id = 'padding-v'
): InspectRow => ({
  id,
  label: 'Vertical',
  value: { raw: '9px', shown: '9', ...over },
  ...rowSpec(id),
});

const noop = () => undefined;

describe('ValueField', () => {
  it('draws a text value as an editable field and commits on Enter', () => {
    const onCommit = jest.fn();
    render(
      <ValueField
        row={row({})}
        onCommit={onCommit}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    const input = screen.getByTestId('wb-insp-input') as HTMLInputElement;
    expect(input.value).toBe('9');
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('12');
    expect(screen.getByTestId('wb-insp-value').getAttribute('data-link')).toBe(
      'none'
    );
  });

  it('reverts on Escape and does not commit an unchanged value', () => {
    const onCommit = jest.fn();
    render(
      <ValueField
        row={row({})}
        onCommit={onCommit}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    const input = screen.getByTestId('wb-insp-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.value).toBe('9');
    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('offers to attach when the value equals a token', () => {
    const onAttach = jest.fn();
    render(
      <ValueField
        row={row({ token: '--gv-space-2', link: 'equal' })}
        onCommit={noop}
        onAttach={onAttach}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    fireEvent.click(screen.getByTestId('wb-insp-suggest'));
    expect(onAttach).toHaveBeenCalledWith('--gv-space-2');
    expect(screen.getByLabelText('Attach space-2')).toBeTruthy();
  });

  it('draws a bound value as a pill that opens the picker and can detach', () => {
    const onOpenPicker = jest.fn();
    const onDetach = jest.fn();
    render(
      <ValueField
        row={row({
          token: '--gv-space-2',
          link: 'linked',
          raw: '8px',
          shown: '8',
        })}
        liveToken="8px"
        onCommit={noop}
        onAttach={noop}
        onDetach={onDetach}
        onOpenPicker={onOpenPicker}
      />
    );
    expect(screen.getByTestId('wb-insp-value').getAttribute('data-link')).toBe(
      'linked'
    );
    expect(screen.getByText('space-2')).toBeTruthy();
    fireEvent.click(screen.getByText('space-2'));
    expect(onOpenPicker).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('wb-insp-detach'));
    expect(onDetach).toHaveBeenCalled();
  });

  it('keeps W read-only', () => {
    render(
      <ValueField
        row={row({ raw: '145px', shown: '145' }, 'w')}
        onCommit={noop}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    expect(screen.queryByTestId('wb-insp-input')).toBeNull();
    expect(screen.getByText('145')).toBeTruthy();
  });
});

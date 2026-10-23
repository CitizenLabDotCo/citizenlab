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

  it('steps a number with the arrow keys and commits it exactly', () => {
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
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onCommit).toHaveBeenLastCalledWith('10', true);
    expect(input.value).toBe('10');
    fireEvent.keyDown(input, { key: 'ArrowDown', shiftKey: true });
    expect(onCommit).toHaveBeenLastCalledWith('0', true);
  });

  it('never steps a colour, whose hex shows without its #', () => {
    const onCommit = jest.fn();
    render(
      <ValueField
        row={row({ raw: '#333333', shown: '333333' }, 'fill')}
        onCommit={onCommit}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    const input = screen.getByTestId('wb-insp-input') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('333333');
  });

  it('keeps the field on its value when a step is refused', () => {
    const onCommit = jest.fn(() => false);
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
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onCommit).toHaveBeenCalledWith('10', true);
    expect(input.value).toBe('9');
  });

  it('steps a font weight by 100', () => {
    const onCommit = jest.fn();
    render(
      <ValueField
        row={row({ raw: '400', shown: '400' }, 'weight')}
        onCommit={onCommit}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    fireEvent.keyDown(screen.getByTestId('wb-insp-input'), { key: 'ArrowUp' });
    expect(onCommit).toHaveBeenLastCalledWith('500', true);
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

  it('draws a city value from the theme as a pill whose city glyph attaches', () => {
    const onAttach = jest.fn();
    render(
      <ValueField
        row={row(
          {
            token: '--gv-color-tenant-primary',
            link: 'theme',
            raw: 'rgb(98, 70, 159)',
            shown: '62469F',
            swatch: 'rgb(98, 70, 159)',
          },
          'fill'
        )}
        liveToken="#62469F"
        onCommit={noop}
        onAttach={onAttach}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    expect(screen.getByTestId('wb-insp-value').getAttribute('data-link')).toBe(
      'theme'
    );
    expect(screen.getByText('color-tenant-primary')).toBeTruthy();
    expect(screen.queryByTestId('wb-insp-detach')).toBeNull();
    fireEvent.click(screen.getByTestId('wb-insp-suggest'));
    expect(onAttach).toHaveBeenCalledWith('--gv-color-tenant-primary');
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

describe('ValueField glyph', () => {
  it('opens the picker from a text value glyph', () => {
    const onOpenPicker = jest.fn();
    render(
      <ValueField
        row={row({})}
        onCommit={noop}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={onOpenPicker}
      />
    );
    fireEvent.click(screen.getByLabelText('Choose a token for Vertical'));
    expect(onOpenPicker).toHaveBeenCalled();
  });

  it('has no picker glyph on a read-only value', () => {
    render(
      <ValueField
        row={row({ raw: '145px', shown: '145' }, 'w')}
        onCommit={noop}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    expect(screen.queryByTestId('wb-insp-pick')).toBeNull();
  });
});

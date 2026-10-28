import '../testing/reactGlobal';

import { fireEvent, render, screen } from '@testing-library/react';

import type { ElementEdit } from '../lib/elementEdits';
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
    expect(screen.getByTestId('wb-insp-value').getAttribute('data-raw')).toBe(
      '9px'
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

  it('draws a bound value as a pill that opens the picker and can detach', () => {
    const onOpenPicker = jest.fn();
    const onDetach = jest.fn();
    render(
      <ValueField
        row={row({
          token: '--gv-space-2',
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
    expect(screen.getByTestId('wb-insp-value').getAttribute('data-token')).toBe(
      '--gv-space-2'
    );
    expect(screen.getByText('space-2')).toBeTruthy();
    fireEvent.click(screen.getByText('space-2'));
    expect(onOpenPicker).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('wb-insp-detach'));
    expect(onDetach).toHaveBeenCalled();
  });

  it('writes where the code sets the value under it, with GitHub links', () => {
    render(
      <ValueField
        row={row({ raw: '3px', shown: '3' }, 'radius')}
        source={{
          status: 'traced',
          read: 'theme',
          text: 'props.theme.borderRadius',
          place: {
            file: 'app/component-library/components/Button/index.tsx',
            line: 344,
            href: 'https://github.com/x/blob/c/front/b.tsx#L344',
          },
          def: {
            file: 'app/component-library/utils/styleUtils.ts',
            line: 242,
            href: 'https://github.com/x/blob/c/front/s.ts#L242',
          },
        }}
        onCommit={noop}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    const line = screen.getByTestId('wb-insp-source');
    expect(line.getAttribute('data-status')).toBe('traced');
    expect(line.getAttribute('data-line')).toBe('344');
    expect(line.textContent).toBe(
      'props.theme.borderRadius · Button/index.tsx:344 (defined at utils/styleUtils.ts:242)'
    );
    expect(screen.getByText('Button/index.tsx:344').getAttribute('href')).toBe(
      'https://github.com/x/blob/c/front/b.tsx#L344'
    );
  });

  it('says why a value is not traced', () => {
    render(
      <ValueField
        row={row({})}
        source={{
          status: 'untraced',
          text: 'not traced: this build has no code index',
        }}
        onCommit={noop}
        onAttach={noop}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    expect(screen.getByTestId('wb-insp-source').textContent).toBe(
      'not traced: this build has no code index'
    );
  });

  it('offers the listed tokens with what each does to the look', () => {
    const onAttach = jest.fn();
    render(
      <ValueField
        row={row({ raw: '8px', shown: '8' }, 'radius')}
        suggestions={[
          {
            token: '--gv-radius-control',
            from: '8px',
            to: '3px',
            sameLook: false,
          },
        ]}
        onCommit={noop}
        onAttach={onAttach}
        onDetach={noop}
        onOpenPicker={noop}
      />
    );
    const offer = screen.getByTestId('wb-insp-suggest');
    expect(offer.textContent).toBe(
      'radius-control' + 'changes the look: 8px → 3px'
    );
    fireEvent.click(offer);
    expect(onAttach).toHaveBeenCalledWith('--gv-radius-control');
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

  it('offers to move a typed value to where its name is defined', () => {
    const onDefine = jest.fn();
    const edit = {
      id: 's|0|radius',
      storyId: 's',
      path: [0],
      rowId: 'radius',
      label: 'Radius',
      glyph: 'radius',
      props: ['border-top-left-radius'],
      from: { raw: '3px', shown: '3' },
      to: { value: '6px' },
      kind: 'custom',
      define: {
        name: 'theme.borderRadius',
        file: 'app/component-library/utils/styleUtils.ts',
        line: 242,
      },
      at: 0,
    } satisfies ElementEdit;
    const { rerender } = render(
      <ValueField
        row={row({ raw: '6px', shown: '6' }, 'radius')}
        edit={edit}
        onCommit={noop}
        onAttach={noop}
        onDetach={noop}
        onDefine={onDefine}
        onOpenPicker={noop}
      />
    );
    const button = screen.getByTestId('wb-insp-define');
    expect(button.textContent).toBe(
      "Change theme.borderRadius where it's defined (utils/styleUtils.ts:242), every use follows"
    );
    fireEvent.click(button);
    expect(onDefine).toHaveBeenCalled();
    rerender(
      <ValueField
        row={row({ raw: '6px', shown: '6' }, 'radius')}
        edit={{ ...edit, kind: 'define' as const }}
        onCommit={noop}
        onAttach={noop}
        onDetach={noop}
        onDefine={onDefine}
        onOpenPicker={noop}
      />
    );
    expect(
      screen.getByTestId('wb-insp-define').getAttribute('aria-pressed')
    ).toBe('true');
  });
});

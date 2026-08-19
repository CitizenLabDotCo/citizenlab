import React from 'react';

import {
  AriaGuidanceProps,
  AriaOnChangeProps,
  AriaOnFocusProps,
  GroupBase,
} from 'react-select';
import { IOption } from 'typings';

import { render } from 'utils/testUtils/rtl';

import useA11yMessages from './useA11yMessages';

let a11y: ReturnType<typeof useA11yMessages<IOption, boolean>>;

const Probe = () => {
  a11y = useA11yMessages<IOption, boolean>();
  return null;
};

// react-select hands back the very option object it was given, and the position
// is looked up by identity, so these have to be the same references.
const OPTIONS: IOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

const guidanceProps: AriaGuidanceProps = {
  'aria-label': undefined,
  context: 'input',
  isSearchable: true,
  isMulti: false,
  isDisabled: false,
  tabSelectsValue: true,
  isInitialFocus: true,
};

const focusProps: AriaOnFocusProps<IOption, GroupBase<IOption>> = {
  context: 'menu',
  focused: OPTIONS[1],
  isDisabled: false,
  isSelected: false,
  label: 'Beta',
  options: OPTIONS,
  selectValue: [OPTIONS[1]],
  isAppleDevice: true,
};

const guidance = (overrides: Partial<AriaGuidanceProps> = {}) =>
  a11y.ariaLiveMessages.guidance?.({ ...guidanceProps, ...overrides });

const onFocus = (
  overrides: Partial<AriaOnFocusProps<IOption, GroupBase<IOption>>> = {}
) => a11y.ariaLiveMessages.onFocus?.({ ...focusProps, ...overrides });

const onChange = (props: AriaOnChangeProps<IOption, boolean>) =>
  a11y.ariaLiveMessages.onChange?.(props);

describe('useA11yMessages', () => {
  beforeEach(() => {
    render(<Probe />);
  });

  it('translates the empty and result-count messages', () => {
    expect(a11y.noOptionsMessage()).toBe('No options');
    expect(a11y.screenReaderStatus({ count: 1 })).toBe('1 result available');
    expect(a11y.screenReaderStatus({ count: 7 })).toBe('7 results available');
  });

  describe('guidance', () => {
    it('mentions typing only when the select is searchable', () => {
      expect(guidance()).toContain('type to refine list');
      expect(guidance({ isSearchable: false })).not.toContain(
        'type to refine list'
      );
    });

    it('mentions the selected values only in multi mode', () => {
      expect(guidance({ isMulti: true })).toContain('focus selected values');
      expect(guidance()).not.toContain('focus selected values');
    });

    it('falls back to a translated label when the select has no aria-label', () => {
      expect(guidance()).toContain('Select is focused');
      expect(guidance({ 'aria-label': 'Estate' })).toContain(
        'Estate is focused'
      );
    });

    it('stays silent on a repeat focus of the input', () => {
      expect(guidance({ isInitialFocus: false })).toBe('');
    });

    it('mentions Tab only when Tab selects the option', () => {
      expect(guidance({ context: 'menu' })).toContain('press Tab');
      expect(
        guidance({ context: 'menu', tabSelectsValue: false })
      ).not.toContain('press Tab');
    });

    it('describes value navigation', () => {
      expect(guidance({ context: 'value' })).toContain('Backspace');
    });
  });

  describe('onChange', () => {
    it('announces a selection', () => {
      expect(
        onChange({
          action: 'select-option',
          option: OPTIONS[1],
          value: OPTIONS[1],
          label: 'Beta',
          labels: ['Beta'],
          isDisabled: false,
        })
      ).toBe('option Beta, selected.');
    });

    it('explains why a disabled option was not taken', () => {
      expect(
        onChange({
          action: 'select-option',
          option: OPTIONS[1],
          value: null,
          label: 'Beta',
          labels: [],
          isDisabled: true,
        })
      ).toBe('option Beta is disabled. Select another option.');
    });

    it('announces a deselection', () => {
      expect(
        onChange({
          action: 'deselect-option',
          option: OPTIONS[1],
          value: null,
          label: 'Beta',
          labels: [],
          isDisabled: false,
        })
      ).toBe('option Beta, deselected.');
    });

    it('announces clearing every value', () => {
      expect(
        onChange({
          action: 'clear',
          removedValues: OPTIONS,
          value: null,
          label: '',
          labels: [],
          isDisabled: false,
        })
      ).toBe('All selected options have been cleared.');
    });

    it('pluralises the options already selected on first focus', () => {
      expect(
        onChange({
          action: 'initial-input-focus',
          value: [OPTIONS[0], OPTIONS[1]],
          label: '',
          labels: ['Alpha', 'Beta'],
          isDisabled: false,
        })
      ).toBe('options Alpha, Beta, selected.');

      expect(
        onChange({
          action: 'initial-input-focus',
          value: OPTIONS[0],
          label: '',
          labels: ['Alpha'],
          isDisabled: false,
        })
      ).toBe('option Alpha, selected.');
    });

    it('says nothing for actions with no announcement', () => {
      expect(
        onChange({
          action: 'create-option',
          option: OPTIONS[0],
          value: OPTIONS[0],
          label: 'Alpha',
          labels: ['Alpha'],
          isDisabled: false,
        })
      ).toBe('');
    });
  });

  describe('onFilter', () => {
    it('repeats the result count unchanged when nothing was typed', () => {
      expect(
        a11y.ariaLiveMessages.onFilter?.({
          inputValue: '',
          resultsMessage: '7 results available',
        })
      ).toBe('7 results available');
    });

    it('names the search term when something was typed', () => {
      expect(
        a11y.ariaLiveMessages.onFilter?.({
          inputValue: 'est',
          resultsMessage: '2 results available',
        })
      ).toBe('2 results available for search term est.');
    });
  });

  describe('onFocus', () => {
    it('gives the position of a focused menu option on Apple devices', () => {
      expect(onFocus()).toBe('Beta, 2 of 3.');
    });

    // Everywhere else react-select points `aria-activedescendant` at the
    // option, so announcing it again would double up.
    it('stays silent on a focused menu option elsewhere', () => {
      expect(onFocus({ isAppleDevice: false })).toBe('');
    });

    it('distinguishes selected and disabled options', () => {
      expect(onFocus({ isSelected: true })).toBe('Beta selected, 2 of 3.');
      expect(onFocus({ isDisabled: true })).toBe('Beta disabled, 2 of 3.');
      expect(onFocus({ isSelected: true, isDisabled: true })).toBe(
        'Beta selected disabled, 2 of 3.'
      );
    });

    it('gives the position of a focused value', () => {
      expect(onFocus({ context: 'value' })).toBe('value Beta focused, 1 of 1.');
    });

    it('stays silent when the focused item is not in the list', () => {
      expect(onFocus({ focused: { value: 'z', label: 'Zeta' } })).toBe('');
    });
  });
});

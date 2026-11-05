import { defineMessages } from 'react-intl';

export default defineMessages({
  selectLabel: {
    id: 'app.components.ReactSelect.selectLabel',
    defaultMessage: 'Select',
  },
  noOptions: {
    id: 'app.components.ReactSelect.noOptions',
    defaultMessage: 'No options',
  },
  resultsAvailable: {
    id: 'app.components.ReactSelect.resultsAvailable',
    defaultMessage:
      '{count, plural, one {# result} other {# results}} available',
  },
  guidanceMenu: {
    id: 'app.components.ReactSelect.guidanceMenu',
    defaultMessage:
      'Use Up and Down to choose options, press Enter to select the currently focused option, press Escape to exit the menu.',
  },
  guidanceMenuTabSelects: {
    id: 'app.components.ReactSelect.guidanceMenuTabSelects',
    defaultMessage:
      'Use Up and Down to choose options, press Enter to select the currently focused option, press Escape to exit the menu, press Tab to select the option and exit the menu.',
  },
  guidanceInput: {
    id: 'app.components.ReactSelect.guidanceInput',
    defaultMessage: '{label} is focused, press Down to open the menu.',
  },
  guidanceInputSearchable: {
    id: 'app.components.ReactSelect.guidanceInputSearchable',
    defaultMessage:
      '{label} is focused, type to refine list, press Down to open the menu.',
  },
  guidanceInputMulti: {
    id: 'app.components.ReactSelect.guidanceInputMulti',
    defaultMessage:
      '{label} is focused, press Down to open the menu, press Left to focus selected values.',
  },
  guidanceInputSearchableMulti: {
    id: 'app.components.ReactSelect.guidanceInputSearchableMulti',
    defaultMessage:
      '{label} is focused, type to refine list, press Down to open the menu, press Left to focus selected values.',
  },
  guidanceValue: {
    id: 'app.components.ReactSelect.guidanceValue',
    defaultMessage:
      'Use Left and Right to toggle between focused values, press Backspace to remove the currently focused value.',
  },
  optionSelected: {
    id: 'app.components.ReactSelect.optionSelected',
    defaultMessage: 'option {label}, selected.',
  },
  optionDeselected: {
    id: 'app.components.ReactSelect.optionDeselected',
    defaultMessage: 'option {label}, deselected.',
  },
  optionDisabled: {
    id: 'app.components.ReactSelect.optionDisabled',
    defaultMessage: 'option {label} is disabled. Select another option.',
  },
  optionsAlreadySelected: {
    id: 'app.components.ReactSelect.optionsAlreadySelected',
    defaultMessage:
      '{count, plural, one {option} other {options}} {labels}, selected.',
  },
  selectionCleared: {
    id: 'app.components.ReactSelect.selectionCleared',
    defaultMessage: 'All selected options have been cleared.',
  },
  filterResultsForTerm: {
    id: 'app.components.ReactSelect.filterResultsForTerm',
    defaultMessage: '{resultsMessage} for search term {inputValue}.',
  },
  focusedValue: {
    id: 'app.components.ReactSelect.focusedValue',
    defaultMessage: 'value {label} focused, {index} of {total}.',
  },
  focusedOption: {
    id: 'app.components.ReactSelect.focusedOption',
    defaultMessage: '{label}, {index} of {total}.',
  },
  focusedOptionSelected: {
    id: 'app.components.ReactSelect.focusedOptionSelected',
    defaultMessage: '{label} selected, {index} of {total}.',
  },
  focusedOptionDisabled: {
    id: 'app.components.ReactSelect.focusedOptionDisabled',
    defaultMessage: '{label} disabled, {index} of {total}.',
  },
  focusedOptionSelectedDisabled: {
    id: 'app.components.ReactSelect.focusedOptionSelectedDisabled',
    defaultMessage: '{label} selected disabled, {index} of {total}.',
  },
});

import { useMemo } from 'react';

import {
  AriaGuidanceProps,
  AriaLiveMessages,
  AriaOnChangeProps,
  AriaOnFilterProps,
  AriaOnFocusProps,
  GroupBase,
} from 'react-select';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type A11yMessages<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
> = {
  ariaLiveMessages: AriaLiveMessages<Option, IsMulti, Group>;
  noOptionsMessage: () => string;
  screenReaderStatus: (props: { count: number }) => string;
};

const positionInList = (list: readonly unknown[], item: unknown) => {
  const index = list.indexOf(item);
  return index === -1 ? undefined : { index: index + 1, total: list.length };
};

/**
 * react-select ships its screen-reader announcements as hardcoded English
 * (see `defaultAriaLiveMessages` in the library). On a platform that runs in
 * ~20 locales they have to be translated, so every react-select instance
 * should pass these three props.
 */
const useA11yMessages = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(): A11yMessages<Option, IsMulti, Group> => {
  const { formatMessage } = useIntl();

  return useMemo(() => {
    const guidance = (props: AriaGuidanceProps) => {
      const label = props['aria-label'] ?? formatMessage(messages.selectLabel);

      if (props.context === 'menu') {
        return formatMessage(
          props.tabSelectsValue
            ? messages.guidanceMenuTabSelects
            : messages.guidanceMenu
        );
      }

      if (props.context === 'value') {
        return formatMessage(messages.guidanceValue);
      }

      if (!props.isInitialFocus) return '';

      if (props.isMulti) {
        return formatMessage(
          props.isSearchable
            ? messages.guidanceInputSearchableMulti
            : messages.guidanceInputMulti,
          { label }
        );
      }

      return formatMessage(
        props.isSearchable
          ? messages.guidanceInputSearchable
          : messages.guidanceInput,
        { label }
      );
    };

    const onChange = (props: AriaOnChangeProps<Option, IsMulti>) => {
      const { action, label, labels, isDisabled } = props;

      switch (action) {
        case 'deselect-option':
        case 'pop-value':
        case 'remove-value':
          return formatMessage(messages.optionDeselected, { label });
        case 'clear':
          return formatMessage(messages.selectionCleared);
        case 'initial-input-focus':
          return formatMessage(messages.optionsAlreadySelected, {
            count: labels.length,
            labels: labels.join(', '),
          });
        case 'select-option':
          return isDisabled
            ? formatMessage(messages.optionDisabled, { label })
            : formatMessage(messages.optionSelected, { label });
        default:
          return '';
      }
    };

    const onFilter = ({ inputValue, resultsMessage }: AriaOnFilterProps) =>
      inputValue
        ? formatMessage(messages.filterResultsForTerm, {
            resultsMessage,
            inputValue,
          })
        : resultsMessage;

    const onFocus = (props: AriaOnFocusProps<Option, Group>) => {
      const { context, focused, label, isDisabled, isSelected } = props;

      if (context === 'value') {
        const position = positionInList(props.selectValue, focused);
        return position
          ? formatMessage(messages.focusedValue, { label, ...position })
          : '';
      }

      // On Apple devices react-select drops `aria-activedescendant`, because
      // VoiceOver does not follow it, and announces the focused option through
      // the live region instead.
      if (!props.isAppleDevice) return '';

      const position = positionInList(props.options, focused);
      if (!position) return '';

      if (isSelected && isDisabled) {
        return formatMessage(messages.focusedOptionSelectedDisabled, {
          label,
          ...position,
        });
      }
      if (isSelected) {
        return formatMessage(messages.focusedOptionSelected, {
          label,
          ...position,
        });
      }
      if (isDisabled) {
        return formatMessage(messages.focusedOptionDisabled, {
          label,
          ...position,
        });
      }

      return formatMessage(messages.focusedOption, { label, ...position });
    };

    return {
      ariaLiveMessages: { guidance, onChange, onFilter, onFocus },
      noOptionsMessage: () => formatMessage(messages.noOptions),
      screenReaderStatus: ({ count }: { count: number }) =>
        formatMessage(messages.resultsAvailable, { count }),
    };
  }, [formatMessage]);
};

export default useA11yMessages;

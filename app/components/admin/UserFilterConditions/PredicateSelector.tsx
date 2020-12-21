import React, { memo } from 'react';
import { keys } from 'lodash-es';

import { TRule, ruleTypeConstraints } from './rules';
import { IOption } from 'typings';

import { Select } from 'cl2-component-library';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {
  ruleType: TRule['ruleType'];
  predicate: TRule['predicate'];
  onChange: (predicate: TRule['predicate']) => void;
};

const PredicateSelector = memo(
  ({
    ruleType,
    predicate,
    onChange,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const getMessage = () => {};

    const generateOptions = (): IOption[] => {
      if (ruleType) {
        return keys(ruleTypeConstraints[ruleType]).map((predicate) => {
          const message =
            messages[`predicate_${ruleType}_${predicate}`] ||
            messages[`predicate_${predicate}`];
          return {
            value: predicate,
            label: formatMessage(message),
          };
        });
      } else {
        return [];
      }
    };

    const handleOnChange = (option: IOption) => {
      onChange(option.value);
    };

    return (
      <Select
        value={predicate}
        options={generateOptions()}
        onChange={handleOnChange}
      />
    );
  }
);

export default injectIntl(PredicateSelector);

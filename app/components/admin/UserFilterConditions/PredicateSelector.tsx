import React from 'react';
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

type State = {};

class PredicateSelector extends React.PureComponent<
  Props & InjectedIntlProps,
  State
> {
  generateOptions = (): IOption[] => {
    const {
      ruleType,
      intl: { formatMessage },
    } = this.props;
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

  handleOnChange = (option: IOption) => {
    this.props.onChange(option.value);
  };

  render() {
    const { predicate } = this.props;
    return (
      <Select
        value={predicate}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
      />
    );
  }
}

export default injectIntl(PredicateSelector);

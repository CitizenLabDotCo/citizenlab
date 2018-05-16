import * as React from 'react';
import { keys } from 'lodash';

import { TRule, ruleTypeConstraints } from './rules';
import { IOption } from 'typings';

import Select from 'components/UI/Select';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';


type Props = {
  ruleType: TRule['ruleType'];
  predicate: TRule['predicate'];
  onChange: (predicate: TRule['predicate']) => void;
};

type State = {};

class PredicateSelector extends React.PureComponent<Props & InjectedIntlProps, State> {

  generateOptions = (): IOption[] => {
    if (this.props.ruleType) {
      return keys(ruleTypeConstraints[this.props.ruleType]).map((predicate) => (
        {
          value: predicate,
          label: this.props.intl.formatMessage(messages[`predicate_${predicate}`]),
        }
      ));
    } else {
      return [];
    }
  }

  handleOnChange = (option: IOption) => {
    this.props.onChange(option.value);
  }

  render() {
    const { predicate } = this.props;
    return (
      <Select
        value={predicate}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
        clearable={false}
      />
    );
  }
}

export default injectIntl(PredicateSelector);

import * as React from 'react';
// import { flow } from 'lodash';
// import styled from 'styled-components';

// import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { TRule, ruleTypeConstraints } from './rules';
import { IOption } from 'typings';
import Select from 'components/UI/Select';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

type Props = {
  ruleType: TRule['ruleType'];
  predicate: TRule['predicate'];
  onChange: (predicate: TRule['predicate']) => void;
};

type State = {};

class PredicateSelector extends React.PureComponent<Props & InjectedIntlProps, State> {

  generateOptions = (): IOption[] => {
    if (this.props.ruleType) {
      return ruleTypeConstraints[this.props.ruleType].predicates.map((predicate) => (
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
      />
    );
  }
}

export default injectIntl(PredicateSelector);

import React from 'react';
import { debounce } from 'lodash-es';
import { TRule } from './rules';
import UserFilterConditions from '.';

type Props = {};

type State = {
  rules: TRule[];
  rulesJson: string;
};

const initialRulesJson =
  '[{"ruleType": "email", "predicate": "ends_on", "value": "citizenlab.co"}]';

class TestWrapper extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      rulesJson: initialRulesJson,
      rules: JSON.parse(initialRulesJson),
    };
  }

  handleOnChangeTextArea = (event) => {
    this.setState({ rulesJson: event.target.value });
    this.updateRules(event.target.value);
  };

  updateRules = debounce(
    (rulesJson) => {
      this.setState({ rules: JSON.parse(rulesJson) });
    },
    1000,
    { leading: false, trailing: true }
  );

  handleOnChangeReal = (rules) => {
    this.setState({ rules, rulesJson: JSON.stringify(rules) });
  };

  render() {
    const { rules, rulesJson } = this.state;
    return (
      <>
        <textarea
          value={rulesJson}
          onChange={this.handleOnChangeTextArea}
          style={{ width: 500 }}
        />
        <UserFilterConditions
          rules={rules}
          onChange={this.handleOnChangeReal}
        />
      </>
    );
  }
}

export default TestWrapper;

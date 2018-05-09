import * as React from 'react';
import styled from 'styled-components';

import { TRule } from './rules';

import Button from 'components/UI/Button';
// import messages from './messages';

const Container = styled.div`

`;

type Props = {
  rule: TRule;
  onChange: (rule: TRule) => void;
  onRemove: () => void;
};

type State = {};

class Rule extends React.Component<Props, State> {
  render() {
    const { rule: { ruleType }, onRemove } = this.props;
    return (
      <Container>
        <Button
          onClick={onRemove}
          icon="delete"
        />
        {ruleType}
      </Container>
    );
  }
}

export default Rule;

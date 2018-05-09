import * as React from 'react';
// import styled from 'styled-components';

import { TRule } from './rules';
// import messages from './messages';

type Props = {
  ruleType: TRule['ruleType'];
  onChange: (ruleType: TRule['ruleType']) => void;
};

type State = {};

class FieldSelector extends React.PureComponent<Props, State> {}

export default FieldSelector;

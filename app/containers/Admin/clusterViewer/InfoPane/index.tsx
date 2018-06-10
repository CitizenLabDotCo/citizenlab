
import React from 'react';
import styled from 'styled-components';
import { map, flatten, uniq } from 'lodash';
import { Node, ParentNode, ideasUnder } from '../clusters';
import GenderChart from './GenderChart';
import AgeChart from './AgeChart';
import DomicileChart from './DomicileChart';
import IdeaDetails from './IdeaDetails';
import ClusterDetails from './ClusterDetails';
import Toggle from 'components/UI/Toggle';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const ToggleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  & > * {
    padding: 5px;
  }
`;

type Props = {
  selectedNodes: Node[];
};

type State = {
  normalization: 'absolute' | 'relative';
};

class InfoPane extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      normalization: 'absolute',
    };
  }

  selectedIdeas = () => {
    const { selectedNodes } = this.props;
    return uniq(flatten(map(selectedNodes, (node) => ideasUnder(node))));
  }

  handleOnChangeNormalization = () => {
    this.setState({
      normalization: this.state.normalization === 'absolute' ? 'relative' : 'absolute',
    });
  }

  render() {
    const { selectedNodes } = this.props;
    const { normalization } = this.state;
    return (
      <div>
        <ToggleContainer>
          <FormattedMessage {...messages.absolute} />
          <Toggle
            value={this.state.normalization === 'relative'}
            onChange={this.handleOnChangeNormalization}
          />
          <FormattedMessage {...messages.relative} />
        </ToggleContainer>
        <GenderChart ideaIds={this.selectedIdeas()} normalization={normalization} />
        <AgeChart ideaIds={this.selectedIdeas()} normalization={normalization} />
        <DomicileChart ideaIds={this.selectedIdeas()} normalization={normalization} />
        {selectedNodes.length === 1 && selectedNodes[0].type === 'idea' &&
          <IdeaDetails ideaId={selectedNodes[0].id} />}
        {selectedNodes.length === 1 && selectedNodes[0].type !== 'idea' &&
          <ClusterDetails node={selectedNodes[0] as ParentNode} ideaIds={this.selectedIdeas()} />}
      </div>
    );
  }
}

export default InfoPane;

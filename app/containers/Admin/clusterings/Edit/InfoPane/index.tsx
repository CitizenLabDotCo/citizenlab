
import React from 'react';
import styled from 'styled-components';
import { map, flatten, uniq } from 'lodash';
import { Node, ParentNode, ideasUnder } from 'services/clusterings';
import GenderChart from './GenderChart';
import AgeChart from './AgeChart';
import DomicileChart from './DomicileChart';
import IdeaDetails from './IdeaDetails';
import ClusterDetails from './ClusterDetails';
import Toggle from 'components/UI/Toggle';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import ComparisonSwitcher from './ComparisonSwitcher';

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
  selectedNodes: Node[][];
  activeComparison: number;
  onAddComparison: () => void;
  onChangeActiveComparison: (index: number) => void;
  onDeleteComparison: (index: number) => void;
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
    return uniq(flatten(map(this.comparisonSet(), ideasUnder)));
  }

  comparisonIdeas = () => {
    return this.props.selectedNodes.map((sn) => {
      return uniq(flatten(map(sn, ideasUnder)));
    });
  }

  handleOnChangeNormalization = () => {
    this.setState({
      normalization: this.state.normalization === 'absolute' ? 'relative' : 'absolute',
    });
  }

  comparisonSet = () => {
    return this.props.selectedNodes[this.props.activeComparison];
  }

  render() {
    const { activeComparison, onAddComparison, onChangeActiveComparison, onDeleteComparison, selectedNodes } = this.props;
    const { normalization } = this.state;
    const comparisonSet = this.comparisonSet();
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
        <ComparisonSwitcher
          activeComparison={activeComparison}
          comparisonCount={selectedNodes.length}
          onAddComparison={onAddComparison}
          onDeleteComparison={onDeleteComparison}
          onChangeActiveComparison={onChangeActiveComparison}
        />
        <GenderChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
        <AgeChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
        <DomicileChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
        {comparisonSet.length === 1 && comparisonSet[0].type === 'idea' &&
          <IdeaDetails ideaId={comparisonSet[0].id} />}
        {comparisonSet.length === 1 && comparisonSet[0].type !== 'idea' &&
          <ClusterDetails node={comparisonSet[0] as ParentNode} ideaIds={this.selectedIdeas()} />}
      </div>
    );
  }
}

export default InfoPane;


import React, { PureComponent } from 'react';
import styled, { css } from 'styled-components';
import { colors } from 'utils/styleUtils';
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

const Container = styled.div``;

const bleh = css`
  background: #fff;
  border: solid 1px ${colors.adminBorder};
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
`;

const ToggleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  ${bleh}

  & > * {
    padding: 5px;
  }
`;

const StyledComparisonSwitcher = styled(ComparisonSwitcher)`
  ${bleh}
`;

const StyledGenderChart = styled(GenderChart)`
  ${bleh}
`;

const StyledAgeChart = styled(AgeChart)`
  ${bleh}
`;

const StyledDomicileChart = styled(DomicileChart)`
  ${bleh}
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

class InfoPane extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      normalization: 'absolute',
    };
  }

  selectedIdeas = () => {
    return uniq(flatten(map(this.comparisonSet(), ideasUnder)));
  }

  comparisonIdeas = () => {
    return this.props.selectedNodes.map((selectedNode) => {
      return uniq(flatten(map(selectedNode, ideasUnder)));
    });
  }

  handleOnChangeNormalization = () => {
    this.setState(({ normalization }) => ({
      normalization: (normalization === 'absolute' ? 'relative' : 'absolute')
    }));
  }

  comparisonSet = () => {
    return this.props.selectedNodes[this.props.activeComparison] || [];
  }

  render() {
    const { activeComparison, onAddComparison, onChangeActiveComparison, onDeleteComparison, selectedNodes } = this.props;
    const { normalization } = this.state;
    const comparisonSet = this.comparisonSet();

    return (
      <Container className={this.props['className']}>
        <ToggleContainer>
          <FormattedMessage {...messages.absolute} />
          <Toggle
            value={this.state.normalization === 'relative'}
            onChange={this.handleOnChangeNormalization}
          />
          <FormattedMessage {...messages.relative} />
        </ToggleContainer>
        <StyledComparisonSwitcher
          activeComparison={activeComparison}
          comparisonCount={selectedNodes.length}
          onAddComparison={onAddComparison}
          onDeleteComparison={onDeleteComparison}
          onChangeActiveComparison={onChangeActiveComparison}
        />
        <StyledGenderChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
        <StyledAgeChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
        <StyledDomicileChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
        {comparisonSet.length === 1 && comparisonSet[0].type === 'idea' &&
          <IdeaDetails ideaId={comparisonSet[0].id} />
        }
        {comparisonSet.length === 1 && comparisonSet[0].type !== 'idea' &&
          <ClusterDetails node={comparisonSet[0] as ParentNode} ideaIds={this.selectedIdeas()} />
        }
      </Container>
    );
  }
}

export default InfoPane;

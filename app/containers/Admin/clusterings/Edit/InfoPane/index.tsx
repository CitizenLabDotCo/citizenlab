
import React, { PureComponent, MouseEvent } from 'react';
import styled from 'styled-components';
import { colors, fontSize } from 'utils/styleUtils';
import { map, flatten, uniq } from 'lodash';
import { Node, ParentNode, ideasUnder } from 'services/clusterings';
import GenderChart from './GenderChart';
import AgeChart from './AgeChart';
import DomicileChart from './DomicileChart';
import IdeaDetails from './IdeaDetails';
import ClusterDetails from './ClusterDetails';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import ComparisonSwitcher from './ComparisonSwitcher';
import Radio from 'components/UI/Radio';
import ComparisonLegend from './ComparisonLegend';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TabbedNav = styled.nav`
  flex: 0 0 55px;
  background: #fcfcfc;
  border-radius: 5px 5px 0 0;
  padding-left: 30px;
  display: flex;
  align-items: strech;
  border: solid 1px ${colors.separation};
  border-bottom: none;
`;

const Tab = styled.li`
  color: ${colors.label};
  font-size: ${fontSize('base')};
  font-weight: 400;
  text-transform: capitalize;
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: solid 3px transparent;

  &:not(:last-child) {
    margin-right: 40px;
  }

  &.active {
    color: ${colors.adminTextColor};
    border-color: ${colors.clBlue};
  }

  &:not(.active):hover {
    border-color: transparent;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: solid 1px ${colors.adminBorder};
  border-radius: 0 0 5px 5px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 30px;
  padding-bottom: 10px;
  overflow: hidden;
  overflow-y: scroll;
`;

const RadioButtons = styled.div`
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  margin-top: 5px;
  margin-left: 20px;
  margin-bottom: 25px;
`;

const StyledRadio = styled(Radio)`
  margin: 0;
  padding: 0;
  margin-right: 25px;
`;

const Details = styled.div`
  padding: 20px;
  padding-top: 0;
`;

const StyledComparisonSwitcher = styled(ComparisonSwitcher)``;

const ChartTitle = styled.h3`
  margin: 0;
  margin-left: 20px;
`;

const StyledGenderChart = styled(GenderChart)`
  margin-top: 15px;
  margin-bottom: 25px;
`;

const StyledAgeChart = styled(AgeChart)`
  margin-top: 15px;
  margin-bottom: 25px;
`;

const StyledDomicileChart = styled(DomicileChart)`
  margin-top: 15px;
  margin-bottom: 25px;
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
  selectedTab: 'votes' | 'details' | 'options';
};

class InfoPane extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      normalization: 'absolute',
      selectedTab: 'votes'
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

  handleOnChangeNormalization = (normalization: 'absolute' | 'relative') => {
    this.setState({ normalization });
  }

  comparisonSet = () => {
    return this.props.selectedNodes[this.props.activeComparison] || [];
  }

  handleTabOnClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({ selectedTab: event.target['dataset']['tab'] });
  }

  render() {
    const { activeComparison, onAddComparison, onChangeActiveComparison, onDeleteComparison, selectedNodes } = this.props;
    const { normalization, selectedTab } = this.state;
    const comparisonSet = this.comparisonSet();

    return (
      <Container className={this.props['className']}>
        <TabbedNav>
          <Tab onClick={this.handleTabOnClick} data-tab="votes" className={`${selectedTab === 'votes' && 'active'}`}>
            Votes
          </Tab>
          <Tab onClick={this.handleTabOnClick} data-tab="details" className={`${selectedTab === 'details' && 'active'}`}>
            Details
          </Tab>
        </TabbedNav>

        <Content>
          {selectedTab === 'options' &&
            <>
              <StyledComparisonSwitcher
                activeComparison={activeComparison}
                comparisonCount={selectedNodes.length}
                onAddComparison={onAddComparison}
                onDeleteComparison={onDeleteComparison}
                onChangeActiveComparison={onChangeActiveComparison}
              />
            </>
          }

          {selectedTab === 'details' && (
            <Details>
              {comparisonSet.length === 1 && comparisonSet[0].type === 'idea' &&
                <IdeaDetails ideaId={comparisonSet[0].id} />
              }
              {comparisonSet.length === 1 && comparisonSet[0].type !== 'idea' &&
                <ClusterDetails node={comparisonSet[0] as ParentNode} ideaIds={this.selectedIdeas()} />
              }
            </Details>
          )}

          {selectedTab === 'votes' &&
            <>
              <ComparisonLegend
                selectedNodes={this.props.selectedNodes}
              />
              <RadioButtons>
                <StyledRadio
                  key="absolute"
                  onChange={this.handleOnChangeNormalization}
                  currentValue={this.state.normalization}
                  value="absolute"
                  label={<FormattedMessage {...messages.absolute} />}
                />
                <StyledRadio
                  key="relative"
                  onChange={this.handleOnChangeNormalization}
                  currentValue={this.state.normalization}
                  value="relative"
                  label={<FormattedMessage {...messages.relative} />}
                />
              </RadioButtons>
              <ChartTitle>Gender</ChartTitle>
              <StyledGenderChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
              <ChartTitle>Age</ChartTitle>
              <StyledAgeChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
              <ChartTitle>Domicile</ChartTitle>
              <StyledDomicileChart ideaIdsComparisons={this.comparisonIdeas()} normalization={normalization} />
            </>
          }
        </Content>
      </Container>
    );
  }
}

export default InfoPane;

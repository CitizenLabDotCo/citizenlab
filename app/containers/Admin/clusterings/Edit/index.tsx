import React, { Component } from 'react';
import { clone } from 'lodash';
import Circles from './Circles';
import { Node, ParentNode } from 'services/clusterings';
import InfoPane from './InfoPane';
import styled, { ThemeProvider } from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import GetClustering, { GetClusteringChildProps } from 'resources/GetClustering';
import { withRouter } from 'react-router';
const anzegemCluster =  require('./anzegem.json');

const Container = styled.div`
  margin: 20px;
`;

const TwoColumns = styled.div`
  display: flex;
`;

interface Props {
  clustering: GetClusteringChildProps;
}

interface State {
  clustering?: ParentNode;
  activeComparison: number;
  selectedNodes: Node[][];
}

class ClusterViewer extends Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      clustering: anzegemCluster,
      activeComparison: 0,
      selectedNodes: [[]],
    };
  }

  comparisonSet = () => {
    return this.state.selectedNodes[this.state.activeComparison];
  }

  handleOnChangeActiveComparison = (activeComparison) => {
    this.setState({ activeComparison });
  }

  theme = () => (theme) => {
    const comparisonColors = ['#fbbd08', '#a333c8', '#f2711c', '#00b5ad'];
    return {
      ...theme,
      comparisonColors,
      selectionColor: comparisonColors[this.state.activeComparison],
      upvotes: theme.colors.success,
      downvotes: theme.colors.error,
    };
  }

  handleOnAddComparison = () => {
    this.setState({
      selectedNodes: [...this.state.selectedNodes, []],
      activeComparison: this.state.selectedNodes.length,
    });
  }

  handleOnDeleteComparison = (index) => {
    const { activeComparison, selectedNodes } = this.state;
    const newSelectedNodes = selectedNodes.slice(index, 1);
    const newActiveComparison = activeComparison >= index ? newSelectedNodes.length : activeComparison;
    this.setState({
      selectedNodes: newSelectedNodes,
      activeComparison: newActiveComparison,
    });
  }

  handleOnClickNode = (node: Node) => {
    const selectedNodes = clone(this.state.selectedNodes);
    selectedNodes[this.state.activeComparison] = [node];
    this.setState({ selectedNodes });
  }

  handleOnShiftClickNode = (node: Node) => {
    const selectedNodes = clone(this.state.selectedNodes);
    selectedNodes[this.state.activeComparison] = [...this.comparisonSet(), node];
    this.setState({ selectedNodes });
  }



  render() {
    const { clustering } = this.props;
    const { activeComparison, selectedNodes } = this.state;
    if (isNilOrError(clustering)) return null;

    return (
      <Container>
        <ThemeProvider theme={this.theme()}>
          <TwoColumns>
            <Circles
              structure={clustering.attributes.structure}
              selectedNodes={this.comparisonSet()}
              onClickNode={this.handleOnClickNode}
              onShiftClickNode={this.handleOnShiftClickNode}
            />
            <InfoPane
              activeComparison={activeComparison}
              selectedNodes={selectedNodes}
              onAddComparison={this.handleOnAddComparison}
              onChangeActiveComparison={this.handleOnChangeActiveComparison}
              onDeleteComparison={this.handleOnDeleteComparison}
            />
          </TwoColumns>
        </ThemeProvider>
      </Container>
    );
  }
}

export default withRouter((inputProps) => (
  <GetClustering id={inputProps.params.clusteringId}>
    {(clustering) => <ClusterViewer {...inputProps} clustering={clustering} />}
  </GetClustering>
));

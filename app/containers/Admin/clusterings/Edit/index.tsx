import React, { Component } from 'react';
import Circles from './Circles';
import { Node, ParentNode } from 'services/clusterings';
import InfoPane from './InfoPane';
import styled from 'styled-components';
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
  selectedNodes: Node[];
}

class ClusterViewer extends Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      clustering: anzegemCluster,
      selectedNodes: [],
    };
  }

  handleOnClickNode = (node: Node) => {
    this.setState({
      selectedNodes: [node],
    });
  }

  handleOnShiftClickNode = (node: Node) => {
    this.setState({
      selectedNodes: [...this.state.selectedNodes, node]
    });
  }

  render() {
    const { clustering } = this.props;
    if (isNilOrError(clustering)) return null;

    return (
      <Container>
        <TwoColumns>
          <Circles
            structure={clustering.attributes.structure}
            selectedNodes={this.state.selectedNodes}
            onClickNode={this.handleOnClickNode}
            onShiftClickNode={this.handleOnShiftClickNode}
          />
          <InfoPane
            selectedNodes={this.state.selectedNodes}
          />
        </TwoColumns>
      </Container>
    );
  }
}

export default withRouter((inputProps) => (
  <GetClustering id={inputProps.params.clusteringId}>
    {(clustering) => <ClusterViewer {...inputProps} clustering={clustering} />}
  </GetClustering>
));

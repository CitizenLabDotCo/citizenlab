import React, { Component } from 'react';
import Circles from './Circles';
import { Node, ParentNode } from './clusters';
import InfoPane from './InfoPane';
import styled from 'styled-components';
const anzegemCluster =  require('./anzegem.json');

const Container = styled.div`
  margin: 20px;
`;

const TwoColumns = styled.div`
  display: flex;
`;

interface Props {
}

interface State {
  cluster?: ParentNode;
  selectedNodes: Node[];
}

class ClusterViewer extends Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      cluster: anzegemCluster,
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
    return (
      <Container>
        <TwoColumns>
          <Circles
            cluster={this.state.cluster}
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

export default ClusterViewer;

import React, { Component } from 'react';
import Circles from './Circles';
import { Node, ParentNode } from './clusters';
import InfoPane from './InfoPane';
import styled from 'styled-components';
const anzegemCluster =  require('./anzegem.json');

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

  render() {
    return (
      <TwoColumns>
        <Circles
          cluster={this.state.cluster}
          selectedNodes={this.state.selectedNodes}
          onClickNode={this.handleOnClickNode}
        />
        <InfoPane
          selectedNodes={this.state.selectedNodes}
        />
      </TwoColumns>
    );
  }
}

export default ClusterViewer;

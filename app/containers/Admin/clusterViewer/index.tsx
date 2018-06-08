import React, { Component } from 'react';
import Browser from './Browser';
const anzegemCluster =  require('./anzegem.json');


class ClusterViewer extends Component {

  convertToD3Hierarchy = (data) => {
    const children = data.topics || data.clusters || data.ideas;
    return {
      ...data,
      children: children && children.map(this.convertToD3Hierarchy)
    };
  }

  render() {
    return (
      <Browser
        clusters={this.convertToD3Hierarchy(anzegemCluster)}
      />
    );
  }
}

export default ClusterViewer;

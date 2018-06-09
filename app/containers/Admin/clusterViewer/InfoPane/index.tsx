
import React from 'react';
import { map, flatten, uniq } from 'lodash';
import { Node, ParentNode, ideasUnder } from '../clusters';
import GenderChart from './GenderChart';
import AgeChart from './AgeChart';
import DomicileChart from './DomicileChart';
import IdeaDetails from './IdeaDetails';
import ClusterDetails from './ClusterDetails';

type Props = {
  selectedNodes: Node[];
};

type State = {

};

class InfoPane extends React.Component<Props, State> {

  selectedIdeas = () => {
    const { selectedNodes } = this.props;
    return uniq(flatten(map(selectedNodes, (node) => ideasUnder(node))));
  }

  render() {
    const { selectedNodes } = this.props;
    return (
      <div>
        <GenderChart ideaIds={this.selectedIdeas()} />
        <AgeChart ideaIds={this.selectedIdeas()} />
        <DomicileChart ideaIds={this.selectedIdeas()} />
        {selectedNodes.length === 1 && selectedNodes[0].type === 'idea' &&
          <IdeaDetails ideaId={selectedNodes[0].id} />}
        {selectedNodes.length === 1 && selectedNodes[0].type !== 'idea' &&
          <ClusterDetails node={selectedNodes[0] as ParentNode} ideaIds={this.selectedIdeas()} />}
      </div>
    );
  }
}

export default InfoPane;

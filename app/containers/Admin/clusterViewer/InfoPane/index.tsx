
import React from 'react';
import { Node, ideasUnder } from '../clusters';
import GenderChart from './GenderChart';
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
    if (selectedNodes.length === 1) {
      return ideasUnder(selectedNodes[0]);
    } else {
      return [];
    }
  }

  render() {
    const { selectedNodes } = this.props;
    return (
      <div>
        <GenderChart ideaIds={this.selectedIdeas()} />
        {selectedNodes.map((node) => {
          switch (node.type) {
            case 'idea':
              return <IdeaDetails ideaId={node.id} />;
            case 'custom':
              return <ClusterDetails node={node} ideaIds={this.selectedIdeas()} />;
            default:
              return null;
          }
        })}
      </div>
    );
  }
}

export default InfoPane;

import React, { Component } from 'react';
import T from 'components/T';
import GetIdea from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';
import { ParentNode } from '../clusters';

type Props = {
  ideaIds: string[];
  node: ParentNode;
};

class ClusterDetails extends Component<Props> {

  render() {
    const { ideaIds, node } = this.props;
    if (!node) return null;

    return (
      <div>
        <h3>
          {node.type === 'custom' && node.title}
        </h3>
        <ul>
          {ideaIds.map((id) => (
            <GetIdea key={id} id={id}>
              {(idea) => isNilOrError(idea) ? null : (
                <li key={idea.id}>
                  <T value={idea.attributes.title_multiloc} />
                </li>
              )}
            </GetIdea>
          ))}
        </ul>
      </div>
    );
  }
}

export default ClusterDetails;

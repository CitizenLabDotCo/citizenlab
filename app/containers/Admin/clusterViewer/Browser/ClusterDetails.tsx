import React, { Component } from 'react';
import T from 'components/T';
import GetIdea from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  ideaIds: string[];
  node: any;
};

class ClusterDetails extends Component<Props> {

  render() {
    const { ideaIds, node } = this.props;
    if (!node) return null;

    return (
      <div>
        <h3>
          {node.data.label || node.data.title}
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

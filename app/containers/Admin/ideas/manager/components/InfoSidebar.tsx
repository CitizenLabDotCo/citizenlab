import * as React from 'react';
import { Segment } from 'semantic-ui-react';

import { IIdeaData } from 'services/ideas';
import InfoSidebarSingle from './InfoSidebarSingle';
import InfoSidebarMulti from './InfoSidebarMulti';
interface Props {
  ideas: IIdeaData[];
}

export default class InfoSidebar extends React.Component<Props> {
  render() {
    const multipleSelected = this.props.ideas.length > 1;
    return (
      <Segment>
        {!multipleSelected && <InfoSidebarSingle idea={this.props.ideas[0]} />}
        {multipleSelected && <InfoSidebarMulti ideas={this.props.ideas} />}
      </Segment>
    );
  }
}

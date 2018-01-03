import * as React from 'react';

import { IIdeaData, ideaByIdStream } from 'services/ideas';
import InfoSidebarSingle from './InfoSidebarSingle';
import InfoSidebarMulti from './InfoSidebarMulti';

interface Props {
  ideaIds: string[];
}

export default class InfoSidebar extends React.Component<Props> {
  render() {
    const multipleSelected = this.props.ideaIds.length > 1;
    return (
      <React.Fragment>
        {!multipleSelected && <InfoSidebarSingle ideaId={this.props.ideaIds[0]} />}
        {multipleSelected && <InfoSidebarMulti ideaIds={this.props.ideaIds} />}
      </React.Fragment>
    );
  }
}

import React from 'react';
import InfoSidebarMultiItem from './InfoSidebarMultiItem';
import { Segment, List } from 'semantic-ui-react';

interface Props {
  ideaIds: string[];
  openPreview: (id: string) => void;
}

export default class InfoSidebarMulti extends React.PureComponent<Props> {
  render() {
    const { ideaIds, openPreview } = this.props;

    return (
      <Segment attached="bottom">
        <List bulleted={true}>
          {ideaIds.map((ideaId) => (
            <InfoSidebarMultiItem
              key={ideaId}
              ideaId={ideaId}
              openPreview={openPreview}
            />
          ))}
        </List>
      </Segment>
    );
  }
}

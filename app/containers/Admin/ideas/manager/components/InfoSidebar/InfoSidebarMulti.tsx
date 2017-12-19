import * as React from 'react';

import { Segment, List, Button, Divider } from 'semantic-ui-react';
import InfoSidebarMultiItem from './InfoSidebarMultiItem';

interface Props {
  ideaIds: string[];
}

export default class InfoSidebarMulti extends React.Component<Props> {
  render() {
    const { ideaIds } = this.props;

    return (
      <div>
        <Button.Group size="mini" attached="top">
          <Button>Comment</Button>
          <Button>Merge</Button>
          <Button negative={true}>Delete</Button>
        </Button.Group>
        <Segment attached="bottom">
          <List bulleted={true}>
            {ideaIds.map((ideaId) => (
              <InfoSidebarMultiItem key={ideaId} ideaId={ideaId} />
            ))}
          </List>
        </Segment>
      </div>
    );
  }
}

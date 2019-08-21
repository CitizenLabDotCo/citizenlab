import React from 'react';
import InfoSidebarMultiItem from './InfoSidebarMultiItem';
import { Segment, List } from 'semantic-ui-react';

interface Props {
  postIds: string[];
  openPreview: (id: string) => void;
}

export default class InfoSidebarMulti extends React.PureComponent<Props> {
  render() {
    const { postIds, openPreview } = this.props;

    return (
      <Segment attached="bottom">
        <List bulleted={true}>
          {postIds.map((postId) => (
            <InfoSidebarMultiItem
              key={postId}
              postId={postId}
              openPreview={openPreview}
            />
          ))}
        </List>
      </Segment>
    );
  }
}

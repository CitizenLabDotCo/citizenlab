import React from 'react';

import { Segment, List } from 'semantic-ui-react';

import InfoSidebarMultiItem from './InfoSidebarMultiItem';

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

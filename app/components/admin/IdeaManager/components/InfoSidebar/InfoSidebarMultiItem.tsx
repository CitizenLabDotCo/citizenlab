import React from 'react';
import T from 'components/T';
import { List } from 'semantic-ui-react';
import GetIdea from 'resources/GetIdea';

export default (props: { ideaId: string }) => (
  <GetIdea id={props.ideaId}>
    {idea => {      
      if (!idea) return null;

      return (
        <List.Item>
          <T value={idea.attributes.title_multiloc} />
        </List.Item>
      );
    }}
  </GetIdea>
);

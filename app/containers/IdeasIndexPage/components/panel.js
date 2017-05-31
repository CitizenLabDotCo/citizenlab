import React from 'react';
import { Segment } from 'semantic-ui-react';
import IdeaCards from './panel/ideaCards';
// import LoadButton from './panel/loadButton';

const Panel = () => (
  <Segment style={{ width: 1000, marginLeft: 'auto', marginRight: 'auto' }} basic>
    <IdeaCards />
  </Segment>
);

export default Panel;

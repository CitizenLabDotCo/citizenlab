import React from 'react'
import { Grid, Segment } from 'semantic-ui-react';
import IdeaCards from './panel/ideaCards';
import LoadButton from './panel/loadButton';

const Panel = () => (
  <Segment basic>
    <div style={{ display: 'inline-block', width: '100%' }}>
      <Grid columns={3}>
        <IdeaCards />
        <LoadButton />
      </Grid>
    </div>
  </Segment>
);

export default Panel;

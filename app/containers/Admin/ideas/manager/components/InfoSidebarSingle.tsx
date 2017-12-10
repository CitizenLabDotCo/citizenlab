import * as React from 'react';
import T from 'components/T';
import { IIdeaData } from 'services/ideas';

import { Header, Divider, Icon, Button, Menu } from 'semantic-ui-react';


interface Props {
  idea: IIdeaData;
}

class InfoSidebarSingle extends React.Component<Props> {
  render() {
    const { idea } = this.props;
    if (!idea) return null;

    return (
      <div>
        <Divider horizontal={true}>Idea</Divider>
        <Header as="h5">
          <T value={idea.attributes.title_multiloc} />
        </Header>
        <p>
          <T value={idea.attributes.body_multiloc} />
        </p>
        <Divider horizontal={true}>Actions</Divider>
        <Button.Group>
          <Button>Mark as spam</Button>
          <Button>Delete</Button>
        </Button.Group>
      </div>
    );
  }
}

export default InfoSidebarSingle;

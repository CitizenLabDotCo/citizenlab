import * as React from 'react';
import T from 'components/T';
import { IIdeaData, ideaByIdStream } from 'services/ideas';
import { injectResource, InjectedResourceLoaderProps } from '../resourceLoader';

import { Segment, Header, Divider, Icon, Button, Menu } from 'semantic-ui-react';


interface Props {
  idea: IIdeaData;
}

class InfoSidebarSingle extends React.Component<Props & InjectedResourceLoaderProps<IIdeaData>> {
  render() {
    const { idea } = this.props;
    if (!idea) return null;

    return (
      <div>
        <Button.Group attached="top" size="tiny">
          <Button>Mark as spam</Button>
          <Button negative={true}>Delete</Button>
        </Button.Group>
        <Segment attached="bottom">
          <Header as="h5">
            <T value={idea.attributes.title_multiloc} />
          </Header>
          <p>
            <T value={idea.attributes.body_multiloc} />
          </p>
        </Segment>
      </div>
    );
  }
}

export default injectResource('idea', ideaByIdStream, (props) => props.ideaId)(InfoSidebarSingle);

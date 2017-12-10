import * as React from 'react';
import T from 'components/T';
import { IIdeaData } from 'services/ideas';
import { injectResource, InjectedResourceLoaderProps } from '../resourceLoader';

import { List, Button } from 'semantic-ui-react';


interface Props {
  ideas: IIdeaData[];
}

class InfoSidebarMulti extends React.Component<Props> {
  render() {
    const { ideas } = this.props;

    return (
      <div>
        <List bulleted={true}>
          {ideas.map((idea) => (
            <List.Item key={idea.id}><T value={idea.attributes.title_multiloc} /></List.Item>
          ))}
        </List>
        <Button>Comment on all</Button>
      </div>
    );
  }
}

export default InfoSidebarMulti;

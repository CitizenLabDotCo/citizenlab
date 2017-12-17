import * as React from 'react';
import T from 'components/T';
import { IIdeaData, ideaByIdStream } from 'services/ideas';
import { injectResource, InjectedResourceLoaderProps } from '../resourceLoader';

import { List } from 'semantic-ui-react';


class InfoSidebarMultiItem extends React.PureComponent<InjectedResourceLoaderProps<IIdeaData>> {

  render() {
    const { idea } = this.props;
    if (!idea) return null;

    return (
      <List.Item>
        <T value={idea.attributes.title_multiloc} />
      </List.Item>
    );
  }
}

export default injectResource('idea', ideaByIdStream, (props) => props.ideaId)(InfoSidebarMultiItem);

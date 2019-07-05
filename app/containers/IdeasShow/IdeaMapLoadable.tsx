import React from 'react';
import Loadable from 'react-loadable';
import { Props } from './IdeaMap';

const LoadableIdeaMap = Loadable({
  loading: () => null,
  loader: () => import('./IdeaMap'),
  render(loaded, props: Props) {
    const IdeaMap = loaded.default;

    return <IdeaMap {...props} />;
  }
});

export default LoadableIdeaMap;

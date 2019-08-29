import React from 'react';
import Loadable from 'react-loadable';
import { Props } from '.';

const LoadableDropdownMap = Loadable({
  loading: () => null,
  loader: () => import('.'),
  render(loaded, props: Props) {
    const DropdownMap = loaded.default;

    return <DropdownMap {...props} />;
  }
});

export default LoadableDropdownMap;

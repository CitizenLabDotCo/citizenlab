import React from 'react';
import Loadable from 'react-loadable';
import { Props } from './';
import { LoadableLoadingCitizen } from 'components/UI/LoadableLoading';

const LoadableUserDeleted = Loadable({
  loading: LoadableLoadingCitizen,
  loader: () => import('./'),
  delay: false,
  render(loaded, props: Props) {
    const UserDeleted = loaded.default;

    return <UserDeleted {...props} />;
  },
});

export default LoadableUserDeleted;

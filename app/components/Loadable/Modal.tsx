import React from 'react';
import Loadable from 'react-loadable';
import { InputProps } from 'components/UI/Modal';

const LoadableModal = Loadable({
  loading: () => null,
  loader: () => import('components/UI/Modal'),
  render(loaded, props: InputProps) {
    const Modal = loaded.default;
    return <Modal {...props} />;
  },
});

export default LoadableModal;

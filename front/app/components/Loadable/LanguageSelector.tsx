import React from 'react';
import Loadable from 'react-loadable';

type InputProps = {
  className?: string;
};

const LoadableLanguageSelector = Loadable({
  loading: () => null,
  loader: () => import('containers/Navbar/components/LanguageSelector'),
  render(loaded, props: InputProps) {
    const LanguageSelector = loaded.default;

    return <LanguageSelector {...props} />;
  },
});

export default LoadableLanguageSelector;

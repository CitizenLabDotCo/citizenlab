import React, { useEffect } from 'react';
import clHistory from 'utils/cl-router/history';

interface Props {
  method: 'push' | 'replace';
  path: string;
}

const Redirect = ({ method, path }: Props) => {
  useEffect(() => {
    clHistory[method](path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};

export default Redirect;

import React, { useEffect } from 'react';
import clHistory from 'utils/cl-router/history';

interface Props {
  to: string;
  replace?: boolean;
}

const Navigate = ({ to, replace = false }: Props) => {
  useEffect(() => {
    replace ? clHistory.replace(to) : clHistory.push(to);
  }, [to, replace]);

  return <></>;
};

export default Navigate;

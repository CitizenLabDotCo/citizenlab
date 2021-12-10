import { useEffect } from 'react';

interface Props {
  onMount: () => void;
}

export default ({ onMount }: Props) => {
  useEffect(() => {
    onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

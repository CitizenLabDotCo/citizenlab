import { useEffect } from 'react';

interface Props {
  onMount: () => void;
}

export default ({ onMount }: Props) => {
  useEffect(() => {
    onMount();
  }, []);

  return null;
};

import { useEffect } from 'react';

interface Props {
  onMount: () => void;
}

export default ({ onMount }: Props) => {
  useEffect(() => {
    setTimeout(() => {
      onMount();
    }, 200);
  }, []);

  return null;
};

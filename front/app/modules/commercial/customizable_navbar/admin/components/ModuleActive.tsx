import useFeatureFlag from 'hooks/useFeatureFlag';
import { useEffect } from 'react';

interface Props {
  onMount: () => void;
}

export default ({ onMount }: Props) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });

  useEffect(() => {
    if (!featureEnabled) return;

    onMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureEnabled]);

  return null;
};

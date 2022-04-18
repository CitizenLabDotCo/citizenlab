import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';

interface Props {
  children?: React.ReactNode;
}

export default ({ children }: Props) => {
  const customFieldsActive = useFeatureFlag({ name: 'user_custom_fields' });
  const representativenessActive = useFeatureFlag({
    name: 'representativeness',
  });

  if (!customFieldsActive || !representativenessActive) {
    return null;
  }

  return <>{children}</>;
};

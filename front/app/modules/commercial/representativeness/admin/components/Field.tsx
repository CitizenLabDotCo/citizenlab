import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// typings
import { Multiloc } from 'typings';

interface Props {
  enabled: boolean;
  titleMultiloc: Multiloc;
}

const Field = ({ enabled, titleMultiloc }: Props) => {
  const localize = useLocalize();

  return (
    <div>
      {localize(titleMultiloc)}
      {enabled}
    </div>
  );
};

export default Field;

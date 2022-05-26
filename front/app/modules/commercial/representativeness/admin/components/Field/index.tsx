import React from 'react';

// components
import { Accordion } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';
import FieldContent from './FieldContent';

// typings
import { Multiloc } from 'typings';

interface Props {
  enabled: boolean;
  titleMultiloc: Multiloc;
  isDefault: boolean;
  onToggleEnabled: (event: React.FormEvent) => void;
}

const Field = ({
  enabled,
  titleMultiloc,
  isDefault,
  onToggleEnabled,
}: Props) => {
  return (
    <>
      <Accordion
        title={
          <FieldTitle
            enabled={enabled}
            titleMultiloc={titleMultiloc}
            isDefault={isDefault}
            onToggleEnabled={onToggleEnabled}
          />
        }
      >
        <FieldContent />
      </Accordion>
    </>
  );
};

export default Field;

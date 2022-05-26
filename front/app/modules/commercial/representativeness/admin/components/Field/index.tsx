import React from 'react';

// components
import { Accordion, Box } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';

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
        <Box>SUPPP</Box>
      </Accordion>
    </>
  );
};

export default Field;

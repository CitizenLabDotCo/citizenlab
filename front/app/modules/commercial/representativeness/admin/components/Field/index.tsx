import React from 'react';

// components
import { Accordion } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';
import FieldContent from './FieldContent';

// typings
import { Multiloc } from 'typings';

interface Props {
  fieldId: string;
  titleMultiloc: Multiloc;
  isDefault: boolean;
}

const Field = ({ fieldId, titleMultiloc, isDefault }: Props) => (
  <>
    <Accordion
      title={<FieldTitle titleMultiloc={titleMultiloc} isDefault={isDefault} />}
    >
      <FieldContent fieldId={fieldId} />
    </Accordion>
  </>
);

export default Field;

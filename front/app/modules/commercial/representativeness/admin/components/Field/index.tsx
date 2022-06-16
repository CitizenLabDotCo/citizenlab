import React from 'react';

// components
import { Accordion } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';
import Options from './Options';

// typings
import { Multiloc } from 'typings';

interface Props {
  userCustomFieldId: string;
  titleMultiloc: Multiloc;
  isDefault: boolean;
}

const Field = ({ userCustomFieldId, titleMultiloc, isDefault }: Props) => (
  <>
    <Accordion
      title={<FieldTitle titleMultiloc={titleMultiloc} isDefault={isDefault} />}
    >
      <Options userCustomFieldId={userCustomFieldId} />
    </Accordion>
  </>
);

export default Field;

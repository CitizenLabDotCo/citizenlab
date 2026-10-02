import React from 'react';

import { Text, Toggle } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import { SectionField } from 'components/admin/Section';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
};

const AnswerVisibilityToggle = ({ field }: Props) => {
  const { watch, setValue } = useFormContext();
  const { formatMessage } = useIntl();

  const name = `customFields.${field.index}.answers_visible_to`;
  const isPublic = watch(name) === 'public';

  return (
    <SectionField>
      <Toggle
        id={name}
        checked={isPublic}
        onChange={() =>
          setValue(name, isPublic ? 'moderators' : 'public', {
            shouldDirty: true,
          })
        }
        label={
          <Text as="span" variant="bodyM" my="0px">
            {formatMessage(messages.publicAnswers)}
          </Text>
        }
      />
    </SectionField>
  );
};

export default AnswerVisibilityToggle;

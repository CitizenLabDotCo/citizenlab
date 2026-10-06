import React from 'react';

import { Toggle } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import { supportsPublicAnswers } from 'api/custom_fields/util';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField } from 'components/admin/Section';
import { ResolvedFormBuilderConfig } from 'components/FormBuilder/utils';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
  builderConfig: ResolvedFormBuilderConfig;
};

const AnswerVisibilityToggle = ({ field, builderConfig }: Props) => {
  const { watch, setValue } = useFormContext();
  const { formatMessage } = useIntl();
  const isEnabled = useFeatureFlag({ name: 'input_form_answer_visibility' });

  const name = `customFields.${field.index}.answers_visible_to`;
  const inputType = watch(`customFields.${field.index}.input_type`);
  const isPublic = watch(name) === 'public';

  if (
    !isEnabled ||
    !builderConfig.isParticipationPublic ||
    field.code ||
    !supportsPublicAnswers(inputType)
  ) {
    return null;
  }

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
        label={formatMessage(messages.publicAnswers)}
        description={formatMessage(messages.publicAnswersDescription)}
      />
    </SectionField>
  );
};

export default AnswerVisibilityToggle;

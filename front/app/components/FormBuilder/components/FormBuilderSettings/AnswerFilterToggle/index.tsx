import React from 'react';

import { Toggle } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import { supportsAnswerFilter } from 'api/custom_fields/util';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField } from 'components/admin/Section';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
};

const AnswerFilterToggle = ({ field }: Props) => {
  const { watch, setValue } = useFormContext();
  const { formatMessage } = useIntl();
  const isEnabled = useFeatureFlag({ name: 'input_form_answer_filters' });

  const name = `customFields.${field.index}.show_as_filter`;
  const inputType = watch(`customFields.${field.index}.input_type`);
  const isPublic =
    watch(`customFields.${field.index}.answers_visible_to`) === 'public';
  const checked = watch(name) === true;

  if (!isEnabled || !isPublic || !supportsAnswerFilter(inputType)) {
    return null;
  }

  return (
    <SectionField id="e2e-answer-filter-toggle">
      <Toggle
        id={name}
        checked={checked}
        onChange={() => setValue(name, !checked, { shouldDirty: true })}
        label={formatMessage(messages.useAsFilter)}
        description={formatMessage(messages.useAsFilterDescription)}
      />
    </SectionField>
  );
};

export default AnswerFilterToggle;

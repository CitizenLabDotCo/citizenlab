import React, { useState } from 'react';

import { Toggle } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';
import { supportsPublicAnswers } from 'api/custom_fields/util';
import useSubmissionsCount from 'api/submission_count/useSubmissionCount';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField } from 'components/admin/Section';
import { ResolvedFormBuilderConfig } from 'components/FormBuilder/utils';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import ConfirmPublicAnswersModal from './ConfirmPublicAnswersModal';
import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
  builderConfig: ResolvedFormBuilderConfig;
};

const AnswerVisibilityToggle = ({ field, builderConfig }: Props) => {
  const { watch, setValue } = useFormContext();
  const { formatMessage } = useIntl();
  const isEnabled = useFeatureFlag({ name: 'input_form_answer_visibility' });
  const { phaseId } = useParams({ strict: false });
  const { data: submissionCount } = useSubmissionsCount({ phaseId });
  const [confirming, setConfirming] = useState(false);

  const name = `customFields.${field.index}.answers_visible_to`;
  const inputType = watch(`customFields.${field.index}.input_type`);
  const isPublic = watch(name) === 'public';

  if (
    !isEnabled ||
    !builderConfig.isParticipationPublic ||
    field.code ||
    !supportsPublicAnswers(inputType) ||
    !submissionCount
  ) {
    return null;
  }

  const totalSubmissions = submissionCount.data.attributes.totalSubmissions;

  const setVisibility = (value: 'public' | 'moderators') =>
    setValue(name, value, { shouldDirty: true });

  const handleChange = () => {
    if (isPublic) {
      setVisibility('moderators');
    } else if (totalSubmissions > 0) {
      setConfirming(true);
    } else {
      setVisibility('public');
    }
  };

  return (
    <SectionField>
      <Toggle
        id={name}
        checked={isPublic}
        onChange={handleChange}
        label={formatMessage(messages.publicAnswers)}
        description={formatMessage(messages.publicAnswersDescription)}
      />
      <ConfirmPublicAnswersModal
        opened={confirming}
        submissionCount={totalSubmissions}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setVisibility('public');
          setConfirming(false);
        }}
      />
    </SectionField>
  );
};

export default AnswerVisibilityToggle;

import React from 'react';

import Button from 'design-system/Button';

import useCustomFields from 'api/custom_fields/useCustomFields';

import ChoiceRadio from 'containers/Admin/projects/_shared/components/ChoiceRadio';
import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import actionFormMessages from 'components/admin/ActionForm/messages';

import { useIntl } from 'utils/cl-intl';

import methodSectionMessages from './BuildFields/MethodSection/messages';
import styles from './BuildPanel.module.css';

interface Props {
  projectId: string;
  phaseId: string;
  title: string;
  description: string;
  onAddQuestions: () => void;
}

const NativeSurveyOption = ({
  projectId,
  phaseId,
  title,
  description,
  onAddQuestions,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: customFields } = useCustomFields({ projectId, phaseId });

  const nQuestions = (customFields ?? []).filter(
    (field) => field.enabled && field.input_type !== 'page'
  ).length;
  const hasQuestions = nQuestions > 0;

  return (
    <div className={styles.option}>
      <ChoiceRadio
        value="native_survey"
        title={title}
        titleAdornment={
          hasQuestions && (
            <SummaryPill
              active
              label={formatMessage(actionFormMessages.nQuestions, {
                nQuestions,
              })}
            />
          )
        }
        description={description}
      />
      {customFields && (
        <div className={styles.fullWidth}>
          <Button variant="secondary" size={28} onPress={onAddQuestions}>
            {formatMessage(
              hasQuestions
                ? methodSectionMessages.editSurvey
                : methodSectionMessages.addQuestions
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NativeSurveyOption;

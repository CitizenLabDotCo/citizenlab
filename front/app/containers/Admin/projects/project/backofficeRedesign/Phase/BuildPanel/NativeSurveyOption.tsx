import React from 'react';

import { useRouter } from '@tanstack/react-router';

import Button from 'design-system/Button';

import useCustomFields from 'api/custom_fields/useCustomFields';

import useLocale from 'hooks/useLocale';

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
  const router = useRouter();
  const locale = useLocale();
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
        <div className={styles.questionActions}>
          <Button
            variant="quiet"
            icon="download-16"
            aria-label={formatMessage(methodSectionMessages.downloadForm)}
            disabledReason={
              hasQuestions
                ? undefined
                : formatMessage(methodSectionMessages.addQuestionsToDownload)
            }
            href={
              hasQuestions
                ? router.buildLocation({
                    to: '/$locale/admin/projects/$projectId/phases/$phaseId/survey-form',
                    params: { locale, projectId, phaseId },
                  }).href
                : undefined
            }
            target="_blank"
          />
          {hasQuestions ? (
            <Button variant="secondary" onPress={onAddQuestions}>
              {formatMessage(methodSectionMessages.editSurvey)}
            </Button>
          ) : (
            <Button variant="primary" icon="plus-16" onPress={onAddQuestions}>
              {formatMessage(methodSectionMessages.addQuestions)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NativeSurveyOption;

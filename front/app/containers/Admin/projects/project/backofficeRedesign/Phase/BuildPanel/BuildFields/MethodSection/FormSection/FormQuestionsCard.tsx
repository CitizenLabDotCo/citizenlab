import React, { useState } from 'react';

import { router } from 'routes';

import Button from 'design-system/Button';
import Text from 'design-system/Text';

import useCustomFields from 'api/custom_fields/useCustomFields';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import actionFormMessages from 'components/admin/ActionForm/messages';
import FormInputEditWarningModal from 'components/admin/FormInputEditWarningModal';
import formBuilderMessages from 'components/FormBuilder/components/messages';
import { getTranslatedStringKey } from 'components/FormBuilder/fieldLabels';

import { useIntl } from 'utils/cl-intl';

import PanelField from '../../../PanelField';
import messages from '../messages';
import useOpenInputForm from '../useOpenInputForm';

import styles from './FormSection.module.css';

interface Props {
  projectId: string;
  phaseId: string;
  title: string;
  titleTooltip?: JSX.Element;
  survey: boolean;
}

const FormQuestionsCard = ({
  projectId,
  phaseId,
  title,
  titleTooltip,
  survey,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const localize = useLocalize();
  const [open, setOpen] = useState(false);
  const { data: customFields } = useCustomFields({ projectId, phaseId });
  // Survey forms belong to their phase, so only the input form can be shared.
  const inputForm = useOpenInputForm(projectId, phaseId);

  const questions = (customFields ?? []).filter(
    (field) => field.enabled && field.input_type !== 'page'
  );
  const nQuestions = questions.length;

  return (
    <>
      <PanelField
        reviewKey={nQuestions > 0 ? 'form' : undefined}
        label={title}
        labelTooltip={titleTooltip}
        action={
          customFields &&
          !open && (
            <SummaryPill
              label={formatMessage(actionFormMessages.nQuestions, {
                nQuestions,
              })}
            />
          )
        }
        button={{
          icon: open ? 'chevron-up' : 'chevron-down',
          expanded: open,
          onClick: () => setOpen((open) => !open),
        }}
      >
        {open && (
          <>
            <ol className={styles.questions}>
              {questions.map((question, index) => {
                const type = getTranslatedStringKey(
                  question.input_type,
                  question.key
                );
                const details = [
                  type && formatMessage(type),
                  question.required &&
                    formatMessage(formBuilderMessages.required),
                ].filter(Boolean);

                return (
                  <li key={question.id} className={styles.question}>
                    <Text
                      as="span"
                      variant="ui"
                      tone="secondary"
                      className={styles.number}
                    >
                      {index + 1}
                    </Text>
                    <span className={styles.questionTitle}>
                      {localize(question.title_multiloc)}
                    </span>
                    <Text
                      as="span"
                      variant="ui"
                      tone="secondary"
                      className={styles.details}
                    >
                      {details.join(' · ')}
                    </Text>
                  </li>
                );
              })}
            </ol>
            <div className={styles.actions}>
              {survey ? (
                <Button
                  variant="secondary"
                  onPress={() =>
                    router.navigate({
                      to: '/$locale/admin/projects/$projectId/phases/$phaseId/survey-form/edit',
                      params: { locale, projectId, phaseId },
                    })
                  }
                >
                  {formatMessage(messages.editForm)}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  isDisabled={!inputForm.ready}
                  onPress={inputForm.open}
                >
                  {formatMessage(messages.editForm)}
                </Button>
              )}
            </div>
          </>
        )}
      </PanelField>
      <FormInputEditWarningModal
        variant="panel"
        showEditWarningModal={inputForm.warningOpened}
        setShowEditWarningModal={inputForm.setWarningOpened}
        editFormLink={inputForm.editFormLink}
      />
    </>
  );
};

export default FormQuestionsCard;

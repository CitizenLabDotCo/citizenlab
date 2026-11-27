import React from 'react';

import { CLErrors, Multiloc, SupportedLocale } from 'typings';

import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import DraftPhaseDescription from 'containers/Admin/projects/project/phaseDescription/DraftPhaseDescription';
import descriptionMessages from 'containers/Admin/projects/project/phaseDescription/messages';

import MultilocRichTextField from 'components/admin/MultilocFields/MultilocRichTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import { useIntl } from 'utils/cl-intl';

import styles from './BuildFields.module.css';
import messages from './messages';

interface Props {
  phaseId?: string;
  locale?: SupportedLocale;
  placeholder: string;
  value: Multiloc | undefined;
  errors: CLErrors | null;
  onChange: (description_multiloc: Multiloc) => void;
}

const DescriptionField = ({
  phaseId,
  locale,
  placeholder,
  value,
  errors,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const apiErrorText = useApiErrorText();
  const { data: phase } = usePhase(phaseId);
  const draftDescriptionEnabled = useFeatureFlag({
    name: 'draft_phase_description',
  });

  // Draft descriptions publish on their own, so they keep their own editor.
  if (draftDescriptionEnabled && phaseId) {
    if (!phase) return null;

    return (
      <div className={styles.draftDescription}>
        <DraftPhaseDescription
          key={phaseId}
          variant="panel"
          phaseId={phaseId}
          descriptionMultiloc={phase.data.attributes.description_multiloc}
          draftDescriptionMultiloc={
            phase.data.attributes.draft_description_multiloc
          }
          placeholder={formatMessage(messages.addDescription)}
        />
      </div>
    );
  }

  const errorText = apiErrorText(errors?.description_multiloc);

  return (
    <div className={styles.descriptionField}>
      <MultilocRichTextField
        id="phase-description"
        locale={locale}
        aria-label={formatMessage(descriptionMessages.descriptionLabel)}
        placeholder={placeholder}
        valueMultiloc={value}
        onChange={onChange}
        errorMessage={errorText}
        compactToolbar
        withCTAButton
      />
    </div>
  );
};

export default DescriptionField;

import React from 'react';

import { CLErrors, Multiloc } from 'typings';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import useFeatureFlag from 'hooks/useFeatureFlag';

import DraftPhaseDescription from 'containers/Admin/projects/project/phaseDescription/DraftPhaseDescription';
import descriptionMessages from 'containers/Admin/projects/project/phaseDescription/messages';

import MultilocRichTextField from 'components/admin/MultilocFields/MultilocRichTextField';
import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import Banner from 'design-system/Banner';

import { useIntl } from 'utils/cl-intl';
import { isEmptyMultiloc } from 'utils/helperUtils';

import styles from './BuildFields.module.css';
import messages from './messages';

interface Props {
  projectId: string;
  phaseId: string;
  value: Multiloc | undefined;
  errors: CLErrors | null;
  onChange: (description_multiloc: Multiloc) => void;
}

const DescriptionField = ({
  projectId,
  phaseId,
  value,
  errors,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const apiErrorText = useApiErrorText();
  const { data: phases } = usePhases(projectId);
  const { data: phase } = usePhase(phaseId);
  const draftDescriptionEnabled = useFeatureFlag({
    name: 'draft_phase_description',
  });

  // Draft descriptions publish on their own, so they keep their own editor.
  if (draftDescriptionEnabled) {
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
      {phases &&
        phases.data.length < 2 &&
        (!value || isEmptyMultiloc(value)) && (
          <Banner tone="info">
            {formatMessage(descriptionMessages.emptyDescriptionWarning)}
          </Banner>
        )}
      <MultilocRichTextField
        id="phase-description"
        aria-label={formatMessage(descriptionMessages.descriptionLabel)}
        placeholder={formatMessage(messages.addDescription)}
        valueMultiloc={value}
        onChange={onChange}
        errorMessage={errorText}
        withCTAButton
      />
    </div>
  );
};

export default DescriptionField;

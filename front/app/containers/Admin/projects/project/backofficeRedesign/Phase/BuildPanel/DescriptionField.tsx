import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import useFeatureFlag from 'hooks/useFeatureFlag';

import DraftPhaseDescription from 'containers/Admin/projects/project/phaseDescription/DraftPhaseDescription';
import descriptionMessages from 'containers/Admin/projects/project/phaseDescription/messages';

import Error from 'components/UI/Error';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { isEmptyMultiloc } from 'utils/helperUtils';

import messages from '../../messages';

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
  const { data: phases } = usePhases(projectId);
  const { data: phase } = usePhase(phaseId);
  const draftDescriptionEnabled = useFeatureFlag({
    name: 'draft_phase_description',
  });

  // Draft descriptions publish on their own, so they keep their own editor.
  if (draftDescriptionEnabled) {
    if (!phase) return null;

    return (
      <Box mt="8px">
        <DraftPhaseDescription
          key={phaseId}
          variant="bo"
          phaseId={phaseId}
          descriptionMultiloc={phase.data.attributes.description_multiloc}
          draftDescriptionMultiloc={
            phase.data.attributes.draft_description_multiloc
          }
          placeholder={formatMessage(messages.addDescription)}
        />
      </Box>
    );
  }

  return (
    <Box>
      {phases &&
        phases.data.length < 2 &&
        (!value || isEmptyMultiloc(value)) && (
          <Box mb="8px">
            <Warning variant="bo">
              {formatMessage(descriptionMessages.emptyDescriptionWarning)}
            </Warning>
          </Box>
        )}
      <QuillMultilocWithLocaleSwitcher
        id="phase-description"
        variant="bo"
        minHeight="74px"
        ariaLabel={formatMessage(descriptionMessages.descriptionLabel)}
        placeholder={formatMessage(messages.addDescription)}
        valueMultiloc={value}
        onChange={onChange}
        withCTAButton
      />
      <Error apiErrors={errors?.description_multiloc} />
    </Box>
  );
};

export default DescriptionField;

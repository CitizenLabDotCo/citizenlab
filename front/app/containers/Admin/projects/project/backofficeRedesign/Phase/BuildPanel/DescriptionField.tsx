import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors, Multiloc } from 'typings';

import usePhases from 'api/phases/usePhases';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PhaseDescription from 'containers/Admin/projects/project/phaseDescription';
import descriptionMessages from 'containers/Admin/projects/project/phaseDescription/messages';

import Error from 'components/UI/Error';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { isEmptyMultiloc } from 'utils/helperUtils';

import eventMessages from '../../Event/messages';

interface Props {
  projectId: string;
  value: Multiloc | undefined;
  errors: CLErrors | null;
  onChange: (description_multiloc: Multiloc) => void;
}

const DescriptionField = ({ projectId, value, errors, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(projectId);
  const draftDescriptionEnabled = useFeatureFlag({
    name: 'draft_phase_description',
  });

  // Draft descriptions publish on their own, so they keep their own editor.
  if (draftDescriptionEnabled) return <PhaseDescription />;

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
        placeholder={formatMessage(eventMessages.addDescription)}
        valueMultiloc={value}
        onChange={onChange}
        withCTAButton
      />
      <Error apiErrors={errors?.description_multiloc} />
    </Box>
  );
};

export default DescriptionField;

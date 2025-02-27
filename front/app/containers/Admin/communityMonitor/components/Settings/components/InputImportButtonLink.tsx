import React from 'react';

import { IPhaseData } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { getFormActionsConfig } from 'containers/Admin/projects/project/nativeSurvey/utils';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import UpsellTooltip from 'components/UpsellTooltip';

type Props = {
  project: IProjectData;
  phase: IPhaseData;
};
const InputImportButtonLink = ({ project, phase }: Props) => {
  const { mutate: updatePhase } = useUpdatePhase();

  const inputImporterEnabled = useFeatureFlag({
    name: 'input_importer',
  });

  const { inputImporterLink } = getFormActionsConfig(
    project,
    updatePhase,
    phase
  );

  return (
    <UpsellTooltip disabled={inputImporterEnabled}>
      <ButtonWithLink
        linkTo={inputImporterLink}
        icon="page"
        iconSize="20px"
        buttonStyle="secondary-outlined"
        width="auto"
        mr="8px"
        disabled={!inputImporterEnabled}
      >
        Import inputs
      </ButtonWithLink>
    </UpsellTooltip>
  );
};

export default InputImportButtonLink;

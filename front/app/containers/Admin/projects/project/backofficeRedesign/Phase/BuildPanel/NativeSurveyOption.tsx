import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';

import ChoiceRadio from 'containers/Admin/projects/_shared/components/ChoiceRadio';
import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import actionFormMessages from 'components/admin/ActionForm/messages';

import { useIntl } from 'utils/cl-intl';

import methodSectionMessages from './BuildFields/MethodSection/messages';
import SurveySetupModal from './SurveySetupModal';

interface Props {
  projectId: string;
  phaseId: string;
  name: string;
  title: string;
  description: string;
}

const NativeSurveyOption = ({
  projectId,
  phaseId,
  name,
  title,
  description,
}: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { data: customFields } = useCustomFields({ projectId, phaseId });

  const nQuestions = (customFields ?? []).filter(
    (field) => field.enabled && field.input_type !== 'page'
  ).length;
  const hasQuestions = nQuestions > 0;

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      <ChoiceRadio
        name={name}
        value="native_survey"
        currentValue="native_survey"
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
        onChange={() => {}}
      />
      {customFields && (
        <Button
          buttonStyle="bo-secondary"
          boSize="medium"
          width="100%"
          onClick={() => setOpened(true)}
        >
          {formatMessage(
            hasQuestions
              ? methodSectionMessages.editSurvey
              : methodSectionMessages.addQuestions
          )}
        </Button>
      )}
      <SurveySetupModal
        projectId={projectId}
        phaseId={phaseId}
        hasQuestions={hasQuestions}
        opened={opened}
        onClose={() => setOpened(false)}
      />
    </Box>
  );
};

export default NativeSurveyOption;

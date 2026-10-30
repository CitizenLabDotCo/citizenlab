import React from 'react';

import { Box, Input } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { TSurveyService } from 'api/phases/types';

import projectMessages from 'containers/Admin/projects/project/messages';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import SurveyServiceSelect from './SurveyServiceSelect';

interface Props {
  service: TSurveyService | null | undefined;
  embedUrl: string | null | undefined;
  errors: CLErrors | null | undefined;
  onServiceChange: (service: TSurveyService) => void;
  onEmbedUrlChange: (embedUrl: string) => void;
}

/** The tool and link an external survey phase embeds. */
const ExternalSurveyFields = ({
  service,
  embedUrl,
  errors,
  onServiceChange,
  onEmbedUrlChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      <Box>
        <SurveyServiceSelect value={service} onChange={onServiceChange} />
        <Error apiErrors={errors?.survey_service} />
      </Box>
      <Box>
        <Input
          variant="bo"
          type="text"
          label={formatMessage(projectMessages.surveyEmbedUrl)}
          placeholder="https://"
          value={embedUrl ?? ''}
          onChange={onEmbedUrlChange}
        />
        <Error apiErrors={errors?.survey_embed_url} />
      </Box>
    </Box>
  );
};

export default ExternalSurveyFields;

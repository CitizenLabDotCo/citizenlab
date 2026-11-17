import React from 'react';

import { CLErrors } from 'typings';

import { TSurveyService } from 'api/phases/types';

import projectMessages from 'containers/Admin/projects/project/messages';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import TextField from 'design-system/TextField';

import { useIntl } from 'utils/cl-intl';

import styles from './BuildPanel.module.css';
import SurveyServiceSelect from './SurveyServiceSelect';

interface Props {
  service: TSurveyService | null | undefined;
  embedUrl: string | null | undefined;
  errors: CLErrors | null | undefined;
  onServiceChange: (service: TSurveyService) => void;
  onEmbedUrlChange: (embedUrl: string) => void;
}

const ExternalSurveyFields = ({
  service,
  embedUrl,
  errors,
  onServiceChange,
  onEmbedUrlChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const apiErrorText = useApiErrorText();
  const embedUrlError = apiErrorText(errors?.survey_embed_url);

  return (
    <div className={styles.surveyFields}>
      <SurveyServiceSelect
        value={service}
        errorMessage={apiErrorText(errors?.survey_service)}
        onChange={onServiceChange}
      />
      <TextField
        label={formatMessage(projectMessages.surveyEmbedUrl)}
        placeholder="https://"
        value={embedUrl ?? ''}
        isInvalid={!!embedUrlError}
        errorMessage={embedUrlError}
        onChange={onEmbedUrlChange}
      />
    </div>
  );
};

export default ExternalSurveyFields;

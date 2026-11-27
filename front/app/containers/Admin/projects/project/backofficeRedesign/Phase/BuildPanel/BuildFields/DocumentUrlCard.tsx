import React from 'react';

import { CLErrors } from 'typings';

import { RequiredMarker } from 'design-system/Field';
import Link from 'design-system/Link';
import TextField from 'design-system/TextField';

import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import PanelField from '../PanelField';

interface Props {
  value: string | null | undefined;
  errors: CLErrors | null;
  onChange: (document_annotation_embed_url: string) => void;
}

const DocumentUrlCard = ({ value, errors, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const apiErrorText = useApiErrorText();
  const apiErrors = errors?.document_annotation_embed_url;
  const errorText = apiErrorText(apiErrors);
  const label = formatMessage(configMessages.konveioDocumentAnnotationEmbedUrl);

  return (
    <PanelField
      label={label}
      labelTooltip={
        <FormattedMessage
          {...configMessages.konveioSupport}
          values={{
            supportArticleLink: (
              <Link
                href={formatMessage(configMessages.konveioSupportPageURL2)}
                target="_blank"
                rel="noreferrer"
              >
                {formatMessage(configMessages.konveioSupportArticle)}
              </Link>
            ),
          }}
        />
      }
      action={(!value || apiErrors) && <RequiredMarker />}
    >
      <TextField
        aria-label={label}
        placeholder="https://"
        value={value ?? ''}
        isInvalid={!!errorText}
        errorMessage={errorText}
        onChange={onChange}
      />
    </PanelField>
  );
};

export default DocumentUrlCard;

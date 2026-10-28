import React from 'react';

import { Box, Input, Text, colors } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';

import formBuilderMessages from 'components/FormBuilder/components/messages';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import PanelField from './PanelField';

const DOT_SIZE = '6px';

interface Props {
  value: string | null | undefined;
  errors: CLErrors | null;
  onChange: (document_annotation_embed_url: string) => void;
}

/** The Konveio document a document annotation phase embeds. */
const DocumentUrlCard = ({ value, errors, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const apiErrors = errors?.document_annotation_embed_url;
  const label = formatMessage(configMessages.konveioDocumentAnnotationEmbedUrl);

  return (
    <PanelField
      label={label}
      labelTooltip={
        <FormattedMessage
          {...configMessages.konveioSupport}
          values={{
            supportArticleLink: (
              <a
                href={formatMessage(configMessages.konveioSupportPageURL2)}
                target="_blank"
                rel="noreferrer"
              >
                {formatMessage(configMessages.konveioSupportArticle)}
              </a>
            ),
          }}
        />
      }
      action={
        (!value || apiErrors) && (
          <Box display="flex" alignItems="center" gap="8px" mr="6px">
            <Box
              width={DOT_SIZE}
              height={DOT_SIZE}
              borderRadius="50%"
              background={colors.coolGrey500}
            />
            <Text as="span" fontSize="xs" color="coolGrey500" m="0">
              {formatMessage(formBuilderMessages.required)}
            </Text>
          </Box>
        )
      }
    >
      <Box>
        <Input
          type="text"
          variant="bo"
          ariaLabel={label}
          placeholder="https://"
          value={value}
          onChange={onChange}
        />
        <Error apiErrors={apiErrors} />
      </Box>
    </PanelField>
  );
};

export default DocumentUrlCard;

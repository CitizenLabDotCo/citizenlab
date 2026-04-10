import React from 'react';

import { Box, Divider, Title } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import ImportResponsesSection from 'components/admin/FormSync/ImportResponsesSection';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

export const InputForm = () => {
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  return (
    <Box maxWidth="1200px">
      <SectionTitle>
        <FormattedMessage {...messages.inputForm} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.inputFormDescription} />
      </SectionDescription>
      <Box display="flex" flexDirection="row">
        <ButtonWithLink
          mr="8px"
          linkTo={`/admin/projects/${projectId}/phases/${phaseId}/form/edit`}
          width="auto"
          icon="edit"
          data-cy="e2e-edit-input-form"
          buttonStyle="admin-dark"
        >
          <FormattedMessage {...messages.editInputForm} />
        </ButtonWithLink>
      </Box>
      <Box mt="28px">
        <Divider mb="28px" />
        <Title
          variant="h5"
          color="coolGrey600"
          fontWeight="semi-bold"
          mb="28px"
        >
          {formatMessage(messages.importResponses).toUpperCase()}
        </Title>
        <ImportResponsesSection formType="input_form" />
      </Box>
    </Box>
  );
};

export default InputForm;

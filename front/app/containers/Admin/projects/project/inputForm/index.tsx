import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ImportResponsesSection from 'components/admin/FormSync/ImportResponsesSection';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';

export const InputForm = () => {
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/form',
  });

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
          to="/admin/projects/$projectId/phases/$phaseId/form/edit"
          params={{ projectId, phaseId }}
          width="auto"
          icon="edit"
          data-cy="e2e-edit-input-form"
          buttonStyle="admin-dark"
        >
          <FormattedMessage {...messages.editInputForm} />
        </ButtonWithLink>
      </Box>
      <ImportResponsesSection formType="input_form" />
    </Box>
  );
};

export default InputForm;

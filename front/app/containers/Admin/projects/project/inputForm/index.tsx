import { Button, Box } from '@citizenlab/cl2-component-library';
import React from 'react';

// components
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// router
import clHistory from 'utils/cl-router/history';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// hooks
import { useParams } from 'react-router-dom';

export const IdeaForm = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  return (
    <Box gap="0px" flexWrap="wrap" width="100%" display="flex">
      <Box width="100%">
        <SectionTitle>
          <FormattedMessage {...messages.inputForm} />
        </SectionTitle>
        <SectionDescription style={{ marginRight: '600px' }}>
          <FormattedMessage {...messages.inputFormDescription} />
        </SectionDescription>
      </Box>
      <Box>
        <Button
          onClick={() => {
            clHistory.push(`/admin/projects/${projectId}/ideaform/edit`);
          }}
          width="auto"
          icon="edit"
          data-cy="e2e-edit-input-form"
        >
          <FormattedMessage {...messages.editInputForm} />
        </Button>
      </Box>
    </Box>
  );
};

export default IdeaForm;

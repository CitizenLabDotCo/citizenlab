import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  loading: boolean;
}

const FormActions = ({ loading }: Props) => {
  return (
    <Box display="flex" justifyContent="flex-start">
      <Button type="submit" processing={loading} icon="download">
        <FormattedMessage {...messages.exportAsPDF} />
      </Button>
    </Box>
  );
};

export default FormActions;

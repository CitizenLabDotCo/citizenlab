import React from 'react';

// components
import { SubSectionTitle } from 'components/admin/Section';
import Button from 'components/UI/Button';
import { Box } from 'cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export default () => (
  <Box display="flex" justifyContent="space-between" mb="17px">
    <SubSectionTitle>
      <FormattedMessage {...messages.hiddenFromNavigation} />
    </SubSectionTitle>

    <Button buttonStyle="cl-blue" linkTo="/admin/settings/navigation/pages/new">
      <FormattedMessage {...messages.addPageButton} />
    </Button>
  </Box>
);

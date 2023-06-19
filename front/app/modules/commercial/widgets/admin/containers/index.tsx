import React from 'react';
import IdeasWidget from './IdeasWidget';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import { Box, colors } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';
import GoBackButton from 'components/UI/GoBackButton';

import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

const AdminSettingsWidgets = () => {
  const location = useLocation();
  const hasGoBackLink = location.key !== 'default';

  const goBack = () => {
    clHistory.goBack();
  };

  return (
    <>
      {hasGoBackLink && (
        <Box w="100%">
          <GoBackButton onClick={goBack} />
        </Box>
      )}
      <SectionTitle>
        <FormattedMessage {...messages.titleWidgets} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleWidgets} />
      </SectionDescription>
      <Box background={colors.white} p="40px">
        <IdeasWidget />
      </Box>
    </>
  );
};

export default AdminSettingsWidgets;

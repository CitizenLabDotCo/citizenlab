import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import IdeasWidget from './IdeasWidget';

const AdminSettingsWidgets = () => {
  // const location = useLocation();
  // const hasGoBackLink = location.key !== 'default';
  const hasGoBackLink = Math.random() > 0;

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

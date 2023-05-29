import React from 'react';
import IdeasWidget from './IdeasWidget';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import { Box, colors } from '@citizenlab/cl2-component-library';
import { useLocation, useNavigate } from 'react-router-dom';
import GoBackButton from 'components/UI/GoBackButton';

import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

const AdminSettingsWidgets = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };
  const hasGoBackLink = location.key !== 'default';

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

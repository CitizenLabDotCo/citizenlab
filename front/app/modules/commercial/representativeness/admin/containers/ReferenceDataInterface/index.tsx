import React from 'react';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Link from 'utils/cl-router/Link';
import Fields from './Fields';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const ReferenceDataInterface = () => {
  return (
    <>
      <Box display="flex" justifyContent="flex-start" mb="32px">
        <Button
          linkTo="/admin/dashboard/representativeness"
          buttonStyle="text"
          icon="arrow-back"
          size="2"
          padding="0px"
          text={<FormattedMessage {...messages.backToDashboard} />}
        />
      </Box>
      <Box background="white" px="40px" pt="60px" pb="40px">
        <Title variant="h2">
          <FormattedMessage {...messages.pageTitle} />
        </Title>
        <Text color="label">
          <FormattedMessage
            {...messages.pageDescription}
            values={{
              userRegistrationLink: (
                <Link to="/admin/settings/registration">
                  <FormattedMessage {...messages.userRegistrationLink} />
                </Link>
              ),
            }}
          />
        </Text>

        <Fields />
      </Box>
    </>
  );
};

export default ReferenceDataInterface;

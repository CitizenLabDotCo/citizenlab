import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import ContentContainer from 'components/ContentContainer';
import { Title } from 'components/smallForm';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useSearch } from 'utils/router';

import messages from './messages';

const DisabledAccount = () => {
  const [searchParams] = useSearch({ strict: false });
  const parsedDate = moment(searchParams.get('date')).format('LL');

  return (
    <main>
      <ContentContainer mode="text">
        <Box
          display="flex"
          marginLeft="auto"
          marginRight="auto"
          flexDirection="column"
        >
          <Title>
            <FormattedMessage {...messages.title} />
          </Title>
          <Text>
            <FormattedMessage
              {...messages.text}
              values={{
                TermsAndConditions: (
                  <Link
                    to="/pages/$slug"
                    params={{ slug: 'terms-and-conditions' }}
                  >
                    <FormattedMessage {...messages.termsAndConditions} />
                  </Link>
                ),
              }}
            />
          </Text>
          <Text>
            <FormattedMessage
              {...messages.bottomText}
              values={{ date: <b>{parsedDate}</b> }}
            />
          </Text>
        </Box>
      </ContentContainer>
    </main>
  );
};

export default DisabledAccount;

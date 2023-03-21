import React from 'react';
import moment from 'moment';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Title } from 'components/smallForm';
import { useSearchParams } from 'react-router-dom';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export default () => {
  let [searchParams, _] = useSearchParams();
  const parsedDate = moment(searchParams.get('date')).format('LL');

  return (
    <Box
      display="flex"
      maxWidth="380px"
      px="20px"
      width="100%"
      marginLeft="auto"
      marginRight="auto"
      flexDirection="column"
      mt="60px"
    >
      <Title style={{ paddingTop: '26px' }}>
        <FormattedMessage {...messages.title} />
      </Title>
      <FormattedMessage {...messages.text} />
      <br />
      <FormattedMessage
        {...messages.bottomText}
        values={{ date: parsedDate }}
      />
    </Box>
  );
};

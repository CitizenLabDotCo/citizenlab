import React from 'react';
import moment from 'moment';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Title } from 'components/smallForm';
import { useParams } from 'react-router-dom';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export default () => {
  const { date } = useParams();
  const parsedDate = moment(date).format('LL');

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
      <FormattedMessage
        {...messages.bottomText}
        values={{ date: parsedDate }}
      />
    </Box>
  );
};

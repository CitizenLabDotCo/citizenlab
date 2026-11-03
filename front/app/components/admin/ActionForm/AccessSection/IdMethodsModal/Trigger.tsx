// The way into the identification-fields modal. It pertains to identification
// on the platform as a whole — not to any single sign-in method or security
// check — so it sits directly under the mode cards, outside both groupings. It
// stays out of the way entirely when the platform has no identification method
// in use: there would be nothing to show.

import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useIdMethods from 'api/id_methods/useIdMethods';

import { useIntl } from 'utils/cl-intl';

import { linkStyle } from '../shared';

import messages from './messages';
import { getActiveMethods } from './utils';

import IdMethodsModal from './index';

const IdMethodsModalTrigger = () => {
  const { formatMessage } = useIntl();
  const { data: idMethods } = useIdMethods();
  const [opened, setOpened] = useState(false);

  if (getActiveMethods(idMethods).length === 0) return null;

  return (
    <Box mt="8px">
      <Text
        as="span"
        m="0"
        fontSize="xs"
        style={linkStyle}
        role="button"
        tabIndex={0}
        onClick={() => setOpened(true)}
      >
        {formatMessage(messages.seeWhichIdMethodsAreEnabled)}
      </Text>

      <IdMethodsModal opened={opened} onClose={() => setOpened(false)} />
    </Box>
  );
};

export default IdMethodsModalTrigger;

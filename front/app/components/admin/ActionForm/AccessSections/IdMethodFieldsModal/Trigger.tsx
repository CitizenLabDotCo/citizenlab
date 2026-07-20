// The way into the identification-fields modal from a section that configures
// several methods at once. It belongs to the method block as a whole rather
// than to any single toggle, and it stays out of the way entirely when the
// platform has no identification method in use — there would be nothing to show.

import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useIdMethods from 'api/id_methods/useIdMethods';

import useAuthMethodNames, { getMethodName } from 'hooks/useAuthMethodNames';

import { useIntl } from 'utils/cl-intl';

import { linkStyle } from '../shared';

import messages from './messages';
import { getActiveMethods } from './utils';

import IdMethodFieldsModal from './index';

const Trigger = () => {
  const { formatMessage } = useIntl();
  const authMethodNames = useAuthMethodNames();
  const { data: idMethods } = useIdMethods();
  const [opened, setOpened] = useState(false);

  const activeMethods = getActiveMethods(idMethods);
  if (activeMethods.length === 0) return null;

  // With exactly one method we can name it, which is more informative than the
  // generic plural wording.
  const singleMethod =
    activeMethods.length === 1 ? activeMethods[0] : undefined;

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
        {singleMethod
          ? formatMessage(messages.viewMethodSettings, {
              methodName: getMethodName(singleMethod, authMethodNames),
            })
          : formatMessage(messages.seeWhichIdMethodsAreEnabled)}
      </Text>

      <IdMethodFieldsModal opened={opened} onClose={() => setOpened(false)} />
    </Box>
  );
};

export default Trigger;

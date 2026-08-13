// The "inherited" state of the panel: the action has no permission of its own,
// so the platform-wide defaults apply. The row is deliberately inert — there is
// nothing to configure here until the admin overrides it, at which point the
// regular panel takes over.

import React, { ReactNode } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

interface Props {
  title: ReactNode;
  processing: boolean;
  onOverride: () => void;
}

const PlatformDefaultsHeader = ({ title, processing, onOverride }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12px"
      px="20px"
      py="16px"
      flexWrap="wrap"
    >
      {/* No expand chevron: there is nothing to open in this state. */}
      <Box flex="0 0 auto">
        <Title variant="h4" as="h3" m="0" color="primary">
          {title}
        </Title>
      </Box>

      <Text as="span" m="0" ml="4px" fontSize="xs" color="coolGrey600">
        <FormattedMessage
          {...messages.usingPlatformDefaults}
          values={{
            link: (chunks) => (
              <Link to="/admin/settings/registration">{chunks}</Link>
            ),
          }}
        />
      </Text>

      <Box flex="1 1 auto" />

      <Button
        buttonStyle="secondary-outlined"
        size="s"
        icon="edit"
        width="auto"
        padding="4px 12px"
        processing={processing}
        onClick={onOverride}
      >
        {formatMessage(messages.override)}
      </Button>
    </Box>
  );
};

export default PlatformDefaultsHeader;

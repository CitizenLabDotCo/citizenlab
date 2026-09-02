// The "inherited" state of the panel: the action has no permission of its own,
// so the platform-wide defaults apply. The panel can be opened to read those
// defaults, but nothing in it can be changed until the admin overrides it.

import React, { ReactNode } from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  Title,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

// The line box of the h4 Title below (fontSizes.l at Title's line-height of
// 1.3). The note is set on the same band so the two line boxes have identical
// heights and centre on each other exactly, instead of each being centred on
// the row with its own half-leading.
const TITLE_LINE_HEIGHT = `${fontSizes.l * 1.3}px`;

interface Props {
  title: ReactNode;
  action: string;
  processing: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onOverride: () => void;
}

const PlatformDefaultsHeader = ({
  title,
  action,
  processing,
  isOpen,
  onToggle,
  onOverride,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const userIsAdmin = isAdmin(authUser);

  return (
    <Box
      data-cy="e2e-platform-defaults-header"
      display="flex"
      alignItems="center"
      gap="12px"
      px="20px"
      py="16px"
      flexWrap="wrap"
    >
      <Box
        className={`e2e-action-accordion-${action}`}
        data-cy={`e2e-action-accordion-${action}`}
        as="button"
        type="button"
        display="flex"
        alignItems="center"
        gap="12px"
        p="0"
        background="transparent"
        border="none"
        cursor="pointer"
        style={{ textAlign: 'left' }}
        onClick={onToggle}
      >
        <Icon
          name={isOpen ? 'chevron-down' : 'chevron-right'}
          width="20px"
          height="20px"
          fill={colors.coolGrey600}
        />
        <Title variant="h4" as="h3" m="0" color="primary">
          {title}
        </Title>
      </Box>

      <Text
        as="span"
        m="0"
        mt="4px"
        ml="4px"
        fontSize="xs"
        color="coolGrey600"
        lineHeight={TITLE_LINE_HEIGHT}
      >
        <FormattedMessage
          {...messages.usingPlatformDefaults}
          values={{
            // Only admins can reach the platform-wide settings the link points
            // at, so managers get the same sentence as plain text.
            link: (chunks) =>
              userIsAdmin ? (
                <Link to="/admin/settings/registration">{chunks}</Link>
              ) : (
                <>{chunks}</>
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
        dataCy="e2e-override-platform-defaults"
        processing={processing}
        onClick={onOverride}
      >
        {formatMessage(messages.override)}
      </Button>
    </Box>
  );
};

export default PlatformDefaultsHeader;

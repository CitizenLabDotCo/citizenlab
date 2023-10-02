import React, { useState } from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Title,
  Box,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import Divider from 'components/admin/Divider';

const ConsentModal = ({
  onClose,
  onAccept,
}: {
  onClose: () => void;
  onAccept: () => void;
}) => {
  const [checked, setChecked] = useState(false);
  const { formatMessage } = useIntl();

  return (
    <Box p="24px">
      <Box display="flex" gap="16px" alignItems="center">
        <Icon
          name="alert-circle"
          fill={colors.red500}
          width="40px"
          height="40px"
        />
        <Title>{formatMessage(messages.consentModalTitle)}</Title>
      </Box>

      <Text>{formatMessage(messages.consentModalText1)}</Text>
      <Text>{formatMessage(messages.consentModalText2)}</Text>
      <Text>{formatMessage(messages.consentModalText3)}</Text>
      <Text>
        <FormattedMessage
          {...messages.consentModalText4}
          values={{
            link: (
              <a
                href={formatMessage(messages.consentModalText4Link)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatMessage(messages.consentModalText4LinkText)}
              </a>
            ),
          }}
        />
      </Text>
      <Divider />
      <Checkbox
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        label={formatMessage(messages.consentModalCheckbox)}
      />

      <Box display="flex" justifyContent="flex-end" gap="16px" mt="48px">
        <Button buttonStyle="secondary" onClick={onClose}>
          {formatMessage(messages.consentModalCancel)}
        </Button>
        <Button buttonStyle="primary" onClick={onAccept} disabled={!checked}>
          {formatMessage(messages.consentModalButton)}
        </Button>
      </Box>
    </Box>
  );
};

export default ConsentModal;

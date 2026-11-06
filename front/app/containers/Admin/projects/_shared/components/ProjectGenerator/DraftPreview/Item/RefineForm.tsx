import React, { useId, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import TextArea from 'components/UI/TextArea';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { Appear } from '../../animations';
import messages from '../../messages';

type Props = {
  sending: boolean;
  onSend: (request: string) => void;
  onCancel: () => void;
};

const RefineForm = ({ sending, onSend, onCancel }: Props) => {
  const { formatMessage } = useIntl();
  const id = useId();
  const [request, setRequest] = useState('');

  return (
    <Appear display="flex" flexDirection="column" gap="8px" width="100%">
      <TextArea
        id={id}
        label={formatMessage(messages.refineLabel)}
        value={request}
        onChange={setRequest}
        rows={2}
        autofocus
      />
      <Box display="flex" gap="8px" justifyContent="flex-end">
        <ButtonWithLink
          type="button"
          buttonStyle="bo-text"
          height="30px"
          onClick={onCancel}
        >
          <FormattedMessage {...messages.cancel} />
        </ButtonWithLink>
        <ButtonWithLink
          type="button"
          buttonStyle="bo-primary"
          height="30px"
          icon="send"
          disabled={request.trim() === ''}
          processing={sending}
          onClick={() => onSend(request.trim())}
        >
          <FormattedMessage {...messages.send} />
        </ButtonWithLink>
      </Box>
    </Appear>
  );
};

export default RefineForm;

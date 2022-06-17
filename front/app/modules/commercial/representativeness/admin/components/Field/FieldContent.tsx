import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import Options from './Options';
import Tippy from '@tippyjs/react';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  userCustomFieldId: string;
  allowSubmit: boolean;
}

const FieldContent = ({ userCustomFieldId, allowSubmit }: Props) => (
  <Box
    width="100%"
    height="100%"
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
  >
    <Box
      width="100%"
      background="#FCFCFC"
      border={`1px ${colors.separation} solid`}
      pt="20px"
      pb="12px"
      px="16px"
    >
      <Header />
      <Options userCustomFieldId={userCustomFieldId} />
    </Box>

    <Tippy
      content={<FormattedMessage {...messages.disallowSaveMessage} />}
      disabled={allowSubmit}
      placement="top"
      theme="dark"
    >
      <div>
        <Button disabled={!allowSubmit} text="Save" mt="20px" width="auto" />
      </div>
    </Tippy>
  </Box>
);

export default FieldContent;

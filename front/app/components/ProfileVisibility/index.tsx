import React from 'react';

// components
import { Text, IconTooltip, Checkbox } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  postAnonymously: boolean;
  onChange: () => void;
}

const ProfileVisiblity = ({ postAnonymously, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Text fontWeight="bold">
        {formatMessage(messages.profileVisiblity)}
        <IconTooltip
          content={
            <Text color="white" fontSize="s" m="0">
              {formatMessage(messages.inputsAssociatedWithProfile)}
            </Text>
          }
          iconSize="16px"
          placement="top-start"
          display="inline"
          ml="4px"
          transform="translate(0,-1)"
        />
      </Text>
      <Checkbox
        id="e2e-post-anonymously-checkbox"
        checked={postAnonymously}
        label={<Text>{formatMessage(messages.postAnonymously)}</Text>}
        onChange={onChange}
      />
    </>
  );
};

export default ProfileVisiblity;

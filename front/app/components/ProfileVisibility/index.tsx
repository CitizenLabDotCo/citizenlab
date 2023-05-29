import React from 'react';

// components
import { Text, IconTooltip, Checkbox } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  postAnonymously: boolean;
  setPostAnonymously: (bool: boolean) => void;
}

const ProfileVisiblity = ({ postAnonymously, setPostAnonymously }: Props) => {
  const { formatMessage } = useIntl();

  const handleChangePostAnonymously = () => {
    setPostAnonymously(!postAnonymously);
  };

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
        checked={postAnonymously}
        label={formatMessage(messages.postAnonymously)}
        onChange={handleChangePostAnonymously}
      />
    </>
  );
};

export default ProfileVisiblity;

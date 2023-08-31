import React from 'react';

// components
import {
  Box,
  Text,
  IconTooltip,
  Checkbox,
} from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { FormLabel } from 'components/UI/FormComponents';

interface Props {
  postAnonymously: boolean;
  onChange: () => void;
}

const ProfileVisiblity = ({ postAnonymously, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      p="40px"
      mb="20px"
      boxShadow="0px 2px 4px -1px rgba(0,0,0,0.06)"
      borderRadius="3px"
      width="100%"
      background="white"
    >
      <FormLabel
        htmlFor="e2e-post-anonymously-checkbox"
        labelValue={<>{formatMessage(messages.profileVisiblity)}</>}
        display="flex"
        alignItems="center"
      >
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
      </FormLabel>
      <Checkbox
        id="e2e-post-anonymously-checkbox"
        checked={postAnonymously}
        label={<Text>{formatMessage(messages.postAnonymously)}</Text>}
        onChange={onChange}
      />
    </Box>
  );
};

export default ProfileVisiblity;

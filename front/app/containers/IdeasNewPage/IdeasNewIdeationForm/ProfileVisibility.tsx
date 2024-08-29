import React from 'react';

import {
  Box,
  Text,
  IconTooltip,
  CheckboxWithLabel,
} from '@citizenlab/cl2-component-library';

import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

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
      <CheckboxWithLabel
        dataTestId="e2e-post-idea-anonymously-checkbox"
        checked={postAnonymously}
        label={<Text>{formatMessage(messages.postAnonymously)}</Text>}
        onChange={onChange}
      />
    </Box>
  );
};

export default ProfileVisiblity;

import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import Options from './Options';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';

interface Props {
  userCustomFieldId: string;
  allowSubmit: boolean;
}

const FieldContent = ({ userCustomFieldId, allowSubmit }: Props) => (
  <Box>
    <Box
      background="#FCFCFC"
      width="100%"
      height="100%"
      border={`1px ${colors.separation} solid`}
      pt="20px"
      pb="12px"
      px="16px"
    >
      <Header />
      <Options userCustomFieldId={userCustomFieldId} />
    </Box>

    <Button disabled={!allowSubmit} />
  </Box>
);

export default FieldContent;

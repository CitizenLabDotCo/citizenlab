import React from 'react';

// components
import {
  Box,
  Title,
  Text,
  Icon,
  colors,
  Button,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  open: boolean;
  isLoading: boolean;
  title: React.ReactNode;
  explanation: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}

const PhaseDeselectModal = ({
  open,
  isLoading,
  title,
  explanation,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <Modal width="460px" opened={open} close={onClose}>
      <Box
        display="flex"
        height="64px"
        width="64px"
        borderRadius="100%"
        background={colors.errorLight}
      >
        <Icon
          width="32px"
          height="32px"
          m="auto"
          fill={colors.error}
          name="alert-octagon"
        />
      </Box>
      <Box display="flex" flexDirection="column" width="100%">
        <Box mb="24px">
          <Title variant="h4" color="tenantText">
            {title}
          </Title>
          <Text color="tenantText" fontSize="s">
            {explanation}
          </Text>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          gap="16px"
        >
          <Button buttonStyle="secondary" onClick={onClose}>
            <FormattedMessage {...messages.cancel} />
          </Button>
          <Button onClick={onConfirm} processing={isLoading}>
            <FormattedMessage {...messages.confirm} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PhaseDeselectModal;

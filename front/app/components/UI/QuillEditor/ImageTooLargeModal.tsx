import React from 'react';

import {
  Box,
  Title,
  Text,
  Icon,
  colors,
  Button,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import { MAX_IMAGE_SIZE_MB } from './createQuill';
import messages from './messages';

interface Props {
  opened: boolean;
  close: () => void;
}

/**
 * Follows the layout of components/WarningModal, but with a single dismiss
 * button since there is nothing for the user to confirm here.
 */
const ImageTooLargeModal = ({ opened, close }: Props) => {
  return (
    <Modal
      width="460px"
      opened={opened}
      close={close}
      ariaLabelledBy="quill-image-too-large-title"
      // The editor is regularly rendered inside a modal itself, and the blot
      // formatter's alt text modal sits at 1000002. Stack above both.
      zIndex={1000003}
    >
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
          <Title
            id="quill-image-too-large-title"
            variant="h4"
            color="tenantText"
          >
            <FormattedMessage {...messages.imageTooLargeTitle} />
          </Title>
          <Text color="tenantText" fontSize="s">
            <FormattedMessage
              {...messages.imageTooLarge}
              values={{ maxSizeMb: MAX_IMAGE_SIZE_MB }}
            />
          </Text>
        </Box>
        <Box display="flex" justifyContent="flex-end" width="100%">
          <Button onClick={close}>
            <FormattedMessage {...messages.imageTooLargeConfirm} />
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImageTooLargeModal;

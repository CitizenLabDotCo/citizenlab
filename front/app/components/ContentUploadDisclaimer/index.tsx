import React, { useState } from 'react';
import {
  IconTooltip,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import Modal from 'components/UI/Modal';

const ContentUploadDisclaimerTooltip = () => {
  const { formatMessage } = useIntl();
  const isMobileOrSmaller = useBreakpoint('phone');
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);

  return (
    <>
      <IconTooltip
        content={
          <>
            <Text m="0px" color="white" fontSize="s">
              {formatMessage(messages.contentUploadDisclaimerTooltip)}
            </Text>
            <Text
              onClick={(e) => {
                e.preventDefault();
                setShowFullDisclaimer(true);
              }}
              color="white"
              fontSize="s"
              m="0px"
              mt="8px"
              textDecoration="underline"
              role="button"
              style={{ cursor: 'pointer' }}
            >
              {formatMessage(messages.readFullDisclaimer)}
            </Text>
          </>
        }
        maxTooltipWidth={400}
        placement={isMobileOrSmaller ? 'top' : 'auto'}
      />
      <Modal
        opened={showFullDisclaimer}
        close={() => {
          setShowFullDisclaimer(false);
        }}
        closeOnClickOutside={false}
        header={formatMessage(messages.contentDisclaimerModalHeader)}
      >
        <Text m="32px">
          {formatMessage(messages.contentUploadDisclaimerFull)}
        </Text>
      </Modal>
    </>
  );
};

export default ContentUploadDisclaimerTooltip;

import React, { useState } from 'react';

// components
import Modal from 'components/UI/Modal';
import {
  Box,
  Title,
  Text,
  Input,
  Button,
} from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  open: boolean;
  onClose: () => void;
  reportPath: string;
}

const ShareReportModal = ({ open, onClose, reportPath }: Props) => {
  const reportViewUrl = `${window.location.origin}${reportPath}/viewer`;

  const [linkCopied, setLinkCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportViewUrl).then(function () {
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
      }, 3000);
    });
  };

  const printToPdf = () => {
    window.open(`${reportPath}/print`, '_blank');
  };

  return (
    <Modal
      opened={open}
      close={onClose}
      width="640px"
      header={
        <Title variant="h3" color="primary" my="0px">
          <FormattedMessage {...messages.shareReportTitle} />
        </Title>
      }
    >
      <Box
        display="flex"
        flexDirection="column"
        px="30px"
        pt="10px"
        pb="30px"
        alignItems="flex-start"
      >
        <Title variant="h4" color="primary" mb="10px">
          <FormattedMessage {...messages.shareAsWebLink} />
        </Title>

        <Text color="textSecondary" fontSize="s" mt="0">
          <FormattedMessage {...messages.shareAsWebLinkDesc} />
        </Text>
        <Box marginBottom="20px" width="100%">
          <Input
            type={'text'}
            value={reportViewUrl}
            className="secondaryText"
            disabled={true}
          />
        </Box>

        <Button
          mr="8px"
          icon={linkCopied ? 'check' : 'link'}
          buttonStyle="secondary"
          iconSize="18px"
          onClick={copyToClipboard}
          width="auto"
        >
          <FormattedMessage {...messages.copyLink} />
        </Button>

        <Title variant="h4" color="primary" mt="30px" mb="10px">
          <FormattedMessage {...messages.shareAsPdf} />
        </Title>

        <Text color="textSecondary" fontSize="s" mt="0">
          <FormattedMessage {...messages.shareAsPdfDesc} />
        </Text>

        <Button
          mr="8px"
          buttonStyle="secondary"
          onClick={printToPdf}
          width="auto"
        >
          <FormattedMessage {...messages.printToPdf} />
        </Button>
      </Box>
    </Modal>
  );
};

export default ShareReportModal;

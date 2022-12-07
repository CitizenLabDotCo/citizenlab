import React, { useState } from 'react';

// services
import { createReport } from 'services/reports';

// components
import Modal from 'components/UI/Modal';
import { Box, Title, Text, Input } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateReportModal = ({ open, onClose }: Props) => {
  const [reportTitle, setReportTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const reportTitleTooShort = reportTitle.length <= 2;

  const onCreateReport = async () => {
    if (reportTitleTooShort) return;
    setLoading(true);

    try {
      await createReport(reportTitle);
      setLoading(false);
      onClose();
    } catch {
      // TODO handle error
      setLoading(false);
    }
  };

  return (
    <Modal opened={open} close={onClose} width="640px">
      <Box display="flex" flexDirection="column" alignItems="center" px="100px">
        <Title variant="h2" color="primary" mt="52px">
          <FormattedMessage {...messages.createReportModalTitle} />
        </Title>
        <Text
          color="primary"
          fontSize="s"
          textAlign="center"
          mt="0px"
          mb="32px"
        >
          <FormattedMessage {...messages.createReportModalDescription} />
        </Text>
        <Input
          value={reportTitle}
          type="text"
          label={<FormattedMessage {...messages.createReportModalInputLabel} />}
          onChange={setReportTitle}
          disabled={loading}
        />
        <Button
          bgColor={colors.primary}
          width="auto"
          mt="40px"
          mb="40px"
          disabled={reportTitleTooShort || loading}
          processing={loading}
          onClick={onCreateReport}
        >
          <FormattedMessage {...messages.emptyStateButtonText} />
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateReportModal;

import React from 'react';

import Frame from 'react-frame-component';
import styled from 'styled-components';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import useCampaignPreview from 'api/campaign_previews/useCampaignPreview';

const StyledFrame = styled(Frame)`
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.divider};
  width: 100%;
  height: 450px;
`;

type Props = {
  campaignId: string;
  className?: string;
  children?: React.ReactNode;
  showHeaders?: boolean;
};

const PreviewFrame = ({
  campaignId,
  className,
  children,
  showHeaders,
}: Props) => {
  const { data: previewData } = useCampaignPreview(campaignId);
  const { to, from, reply_to, subject, html } =
    previewData?.data.attributes || {};

  if (!html) return null;

  return (
    <Box>
      {showHeaders && (
        <Box
          p="16px"
          display="flex"
          flexDirection="column"
          gap="4px"
          bgColor={colors.grey100}
          border={`1px solid ${colors.divider}`}
          borderBottom="none"
        >
          <HeaderField labelKey="to" value={to} />
          <HeaderField labelKey="from" value={from} />
          <HeaderField labelKey="reply_to" value={reply_to} />
          <HeaderField labelKey="subject" value={subject} bold={true} />
        </Box>
      )}
      <StyledFrame
        id="e2e-email-preview-iframe"
        className={className}
        initialContent={html}
      >
        {children}
      </StyledFrame>
    </Box>
  );
};

const HeaderField = ({ labelKey, value, bold = false }) => {
  return (
    <Box display="flex" alignItems="center" gap="8px">
      <Text fontWeight="bold" my="0" color="grey600" width="70px">
        <FormattedMessage {...messages[labelKey]} />
      </Text>
      <Text my="0" fontWeight={bold ? 'bold' : 'normal'}>
        {value}
      </Text>
    </Box>
  );
};

export default PreviewFrame;

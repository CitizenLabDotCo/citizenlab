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
  const previewSubject = previewData?.data.attributes.subject;
  const previewHtml = previewData?.data.attributes.html;

  if (!previewHtml) return null;

  return (
    <Box>
      {showHeaders && previewSubject && (
        <Box
          p="16px"
          display="flex"
          flexDirection="column"
          gap="4px"
          bgColor={colors.grey100}
          border={`1px solid ${colors.divider}`}
          borderBottom="none"
        >
          <Box display="flex" alignItems="center" gap="8px">
            <Text fontWeight="bold" my="0" color="grey600" width="70px">
              To
            </Text>
            <Text my="0">Someone </Text>
          </Box>
          <Box display="flex" alignItems="center" gap="8px">
            <Text fontWeight="bold" my="0" color="grey600" width="70px">
              From
            </Text>
            <Text my="0">Someone</Text>
          </Box>
          <Box display="flex" alignItems="center" gap="8px">
            <Text fontWeight="bold" my="0" color="grey600" width="70px">
              Reply-To
            </Text>
            <Text my="0">Someone</Text>
          </Box>
          <Box display="flex" alignItems="center" gap="8px">
            <Text fontWeight="bold" my="0" color="grey600" width="70px">
              <FormattedMessage {...messages.subject} />
            </Text>
            <Text my="0" fontWeight="bold">
              {previewSubject}
            </Text>
          </Box>
        </Box>
      )}
      <StyledFrame
        id="e2e-email-preview-iframe"
        className={className}
        initialContent={previewHtml}
      >
        {children}
      </StyledFrame>
    </Box>
  );
};

export default PreviewFrame;

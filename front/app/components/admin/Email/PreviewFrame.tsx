import React, { useState, useEffect } from 'react';

import Frame from 'react-frame-component';
import styled from 'styled-components';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';
import { Box, Text } from '@citizenlab/cl2-component-library';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
  showSubject?: boolean;
};

const PreviewFrame = ({
  campaignId,
  className,
  children,
  showSubject,
}: Props) => {
  const [previewHtml, setPreviewHtml] = useState<string>();
  const [previewSubject, setPreviewSubject] = useState<string>();

  useEffect(() => {
    const jwt = getJwt();
    fetch(`${API_PATH}/campaigns/${campaignId}/preview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setPreviewHtml(data.html);
        setPreviewSubject(data.subject);
      });
  }, [campaignId]);

  if (!previewHtml) return null;

  // TODO: JS - subject translation
  return (
    <Box>
      {showSubject && previewSubject && (
        <Box my="4px" mb="16px" display="flex" gap="8px">
          <Text fontWeight="bold" my="0">
            <FormattedMessage {...messages.subject} />
          </Text>
          <Text my="0">{previewSubject}</Text>
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

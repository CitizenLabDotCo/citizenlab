import React, { useState, useEffect } from 'react';

import Frame from 'react-frame-component';
import styled from 'styled-components';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

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
};

const PreviewFrame = ({ campaignId, className, children }: Props) => {
  const [previewHtml, setPreviewHtml] = useState<string>();

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
      });
  }, [campaignId]);

  if (!previewHtml) return null;

  return (
    <StyledFrame
      id="e2e-email-preview-iframe"
      className={className}
      initialContent={previewHtml}
    >
      {children}
    </StyledFrame>
  );
};

export default PreviewFrame;

import React from 'react';
import styled from 'styled-components';
import { Box } from 'cl2-component-library';

const StyledIframe = styled.iframe`
  display: block;
  border: none;
  height: 600px;
  flex-basis: 640px;
  border: 1px solid #ccc;
`;

type Props = {
  microsoftFormsUrl: string;
  className?: string;
};

const MicrosoftFormsSurvey = ({ microsoftFormsUrl, className }: Props) => {
  return (
    <Box display="flex" justifyContent="center" className={className}>
      <StyledIframe src={microsoftFormsUrl} />
    </Box>
  );
};

export default MicrosoftFormsSurvey;

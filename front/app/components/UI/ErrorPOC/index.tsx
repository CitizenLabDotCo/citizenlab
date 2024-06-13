import React from 'react';

import {
  Icon,
  colors,
  fontSizes,
  Box,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const ErrorMessageText = styled.div`
  flex: 1;
  color: ${colors.red600};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  a {
    color: ${colors.red600};
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      color: ${colors.red600};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 500;
  }
`;

const ErrorIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.red600};
  margin-right: 10px;
`;

const ErrorContainer = styled.div<{ showBackground: boolean }>`
  display: flex;
  align-items: center;
  background: ${(props) =>
    props.showBackground ? colors.errorLight : 'transparent'};
  padding: 10px;
  border-radius: 4px;
`;

interface ErrorProps {
  errors?: { error: string }[];
  text?: string | JSX.Element | null;
  showIcon?: boolean;
  showBackground?: boolean;
  marginTop?: string;
  marginBottom?: string;
}

const ErrorPOC: React.FC<ErrorProps> = ({
  errors,
  text,
  showIcon = true,
  showBackground = true,
  marginTop = '3px',
  marginBottom = '0px',
}) => {
  if ((!errors || errors.length === 0) && !text) return null;

  return (
    <Box marginTop={marginTop} marginBottom={marginBottom}>
      <ErrorContainer showBackground={showBackground}>
        {showIcon && <ErrorIcon name="alert-circle" />}
        <ErrorMessageText>
          {text && <>{text}</>}
          {errors &&
            errors.length > 0 &&
            (errors.length === 1 ? (
              <p>{errors[0].error}</p>
            ) : (
              <ul>
                {errors.map((err, index) => (
                  <li key={index}>{err.error}</li>
                ))}
              </ul>
            ))}
        </ErrorMessageText>
      </ErrorContainer>
    </Box>
  );
};

export default ErrorPOC;

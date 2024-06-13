import React from 'react';

import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
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
  fieldLabel?: string;
  showIcon?: boolean;
  showBackground?: boolean;
}

const ErrorPOC: React.FC<ErrorProps> = ({
  errors,
  text,
  fieldLabel,
  showIcon = true,
  showBackground = true,
}) => {
  if (!errors && !text) return null;

  return (
    <ErrorContainer showBackground={showBackground}>
      {showIcon && <ErrorIcon name="alert-circle" />}
      <ErrorMessageText>
        {text && <>{text}</>}
        {errors && errors.length > 0 && (
          <ul>
            {errors.map((err, index) => (
              <li key={index}>
                {fieldLabel ? `${fieldLabel}: ${err.error}` : err.error}
              </li>
            ))}
          </ul>
        )}
      </ErrorMessageText>
    </ErrorContainer>
  );
};

export default ErrorPOC;

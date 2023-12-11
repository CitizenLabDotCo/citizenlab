import React from 'react';

// component
import { RightColumn } from 'containers/Admin';
import Error from 'components/UI/Error';

// styling
import styled from 'styled-components';
import { stylingConsts } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { Locale } from 'typings';

export const StyledRightColumn = styled(RightColumn)`
  height: calc(100vh - ${stylingConsts.menuHeight}px);
  z-index: 2;
  margin: 0;
  max-width: 100%;
  align-items: center;
  padding-bottom: 100px;
  overflow-y: auto;
`;

export const ErrorMessage = ({
  localesWithError,
}: {
  localesWithError: Locale[];
}) => {
  if (localesWithError.length === 0) return null;
  return (
    <Error
      text={
        <FormattedMessage
          {...messages.localeErrorMessage}
          values={{
            locale: localesWithError[0].toUpperCase(),
          }}
        />
      }
    />
  );
};

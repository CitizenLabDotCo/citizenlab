import React, { ReactNode } from 'react';

import {
  colors,
  Icon,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import CookieModalContentContainer from './CookieModalContentContainer';
import messages from './messages';

interface Props {
  id?: string;
  children?: ReactNode;
}

const BaseMainContent = ({ id, children }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <CookieModalContentContainer id={id}>
      <Icon name="cookie" fill={colors.primary} />
      <Title as="h1" variant={isSmallerThanPhone ? 'h4' : 'h3'}>
        <FormattedMessage {...messages.cookieModalTitle} />
      </Title>
      {children}
    </CookieModalContentContainer>
  );
};

export default BaseMainContent;

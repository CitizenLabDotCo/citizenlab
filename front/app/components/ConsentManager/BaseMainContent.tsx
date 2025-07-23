import React, { ReactNode } from 'react';

import {
  colors,
  Icon,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import CookieModalContentContainer from './CookieModalContentContainer';

interface Props {
  id: string;
  titleMessage: { id: string; defaultMessage: string };
  children?: ReactNode;
}

const BaseMainContent = ({ id, titleMessage, children }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <CookieModalContentContainer id={id}>
      <Icon name="cookie" fill={colors.primary} />
      <Title as="h1" variant={isSmallerThanPhone ? 'h3' : 'h1'}>
        <FormattedMessage {...titleMessage} />
      </Title>
      {children}
    </CookieModalContentContainer>
  );
};

export default BaseMainContent;

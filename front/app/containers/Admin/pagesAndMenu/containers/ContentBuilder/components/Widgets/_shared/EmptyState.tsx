import React from 'react';

import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import Warning from 'components/UI/Warning';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import { CarrouselContainer } from './BaseCarrousel/Containers';

const isHomepageBuilder = (pathname: string) => {
  return pathname.includes('/homepage-builder');
};

interface Props {
  titleMultiloc: Multiloc;
  explanation: MessageDescriptor;
}

// Only show this if we are in homepage builder
const EmptyState = ({ titleMultiloc, explanation }: Props) => {
  const location = useLocation();
  const isSmallerThanPhone = useBreakpoint('phone');
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (isHomepageBuilder(location.pathname)) {
    return (
      <CarrouselContainer>
        <Title
          variant="h3"
          mt="0px"
          ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        >
          {localize(titleMultiloc)}
        </Title>
        <Warning>{formatMessage(explanation)}</Warning>
      </CarrouselContainer>
    );
  }

  return null;
};

export default EmptyState;

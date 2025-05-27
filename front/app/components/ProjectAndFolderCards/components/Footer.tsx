import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  ${media.phone`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

interface Props {
  loadingMore: boolean;
  onShowMore: () => void;
}

const Footer = ({ loadingMore, onShowMore }: Props) => {
  return (
    <Container>
      <ButtonWithLink
        data-testid="show-more-button"
        onClick={onShowMore}
        buttonStyle="primary-outlined"
        text={<FormattedMessage {...messages.showMore} />}
        processing={loadingMore}
        height="50px"
        icon="refresh"
        iconPos="left"
        className={`e2e-project-cards-show-more-button ${
          loadingMore ? 'loading' : ''
        }`}
      />
    </Container>
  );
};

export default Footer;

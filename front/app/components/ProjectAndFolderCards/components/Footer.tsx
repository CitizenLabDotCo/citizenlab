import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import styled, { useTheme } from 'styled-components';

import Button from 'components/UI/Button';

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
  const theme = useTheme();

  return (
    <Container>
      <Button
        data-testid="show-more-button"
        onClick={onShowMore}
        buttonStyle="secondary-outlined"
        text={<FormattedMessage {...messages.showMore} />}
        processing={loadingMore}
        height="50px"
        icon="refresh"
        iconPos="left"
        textColor={theme.colors.tenantText}
        bgColor={rgba(theme.colors.tenantText, 0.08)}
        bgHoverColor={rgba(theme.colors.tenantText, 0.12)}
        fontWeight="500"
        className={`e2e-project-cards-show-more-button ${
          loadingMore ? 'loading' : ''
        }`}
      />
    </Container>
  );
};

export default Footer;

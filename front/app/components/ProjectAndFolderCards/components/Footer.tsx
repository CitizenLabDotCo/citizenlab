import React from 'react';

// components
import Button from 'components/UI/Button';

// styling
import styled, { useTheme } from 'styled-components';
import { media } from 'utils/styleUtils';
import { rgba } from 'polished';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

const ShowMoreButton = styled(Button)``;

interface Props {
  loadingMore: boolean;
  onShowMore: () => void;
}

const Footer = ({ loadingMore, onShowMore }: Props) => {
  const theme: any = useTheme();

  return (
    <Container>
      <ShowMoreButton
        data-testid="show-more-button"
        onClick={onShowMore}
        buttonStyle="secondary"
        text={<FormattedMessage {...messages.showMore} />}
        processing={loadingMore}
        height="50px"
        icon="showMore"
        iconPos="left"
        textColor={theme.colorText}
        bgColor={rgba(theme.colorText, 0.08)}
        bgHoverColor={rgba(theme.colorText, 0.12)}
        fontWeight="500"
        className={`e2e-project-cards-show-more-button ${
          loadingMore ? 'loading' : ''
        }`}
      />
    </Container>
  );
};

export default Footer;
